import { TextChannel, MessageReaction, Message } from 'discord.js';
import { getRepository } from 'typeorm';
import { Event } from '../entity/Event';
import { createEmbed } from '../utils/create-embed';
import joinEvent, { JOIN_RESULT } from './join';
import leaveEvent, { LEAVE_RESULT } from './leave';
import { Player } from '../entity/Player';
import logger from '../logger';

export const getEventsDetails = async ({
  guildId,
  channel,
}: {
  guildId: string;
  channel: TextChannel;
}): Promise<Message | undefined> => {
  const eventRepository = getRepository(Event);
  const events = await eventRepository.find({
    where: { guildId },
    relations: ['players'],
  });

  const embed = createEmbed(events);

  try {
    const posted = await channel.send(embed);

    await Promise.all(
      events.map(async (event) => {
        await posted.react(event.emoji);
      })
    );

    const emojiFilter = (reaction: MessageReaction): boolean =>
      events.some((e) => e.emoji === reaction.emoji.name);

    const collector = posted.createReactionCollector(emojiFilter, {
      time: 1000 * 60 * 10,
      dispose: true,
    });

    collector.on('collect', async (reaction, user) => {
      const joinResult = await joinEvent({
        guildId,
        discordId: user.id,
        emoji: reaction.emoji.name,
      });

      if (joinResult === JOIN_RESULT.JOINED) {
        const updatedEvents = await eventRepository.find({
          where: { guildId },
          relations: ['players'],
          cache: false,
        });
        posted.edit(createEmbed(updatedEvents));
      }
    });

    collector.on('remove', async (reaction, user) => {
      const playerRepository = getRepository(Player);

      const player = await playerRepository.findOne({
        where: { discordId: user.id },
        relations: ['joinedEvent'],
      });

      // if there is no player info or if the emoji being removed doesnt match, do nothing
      if (!player || player.joinedEvent.emoji !== reaction.emoji.name) {
        return;
      }

      const leave = await leaveEvent({
        discordId: user.id,
        guildId,
      });

      if (
        leave.result === LEAVE_RESULT.LEFT_EVENT ||
        leave.result === LEAVE_RESULT.TRANSFERRED ||
        leave.result === LEAVE_RESULT.EVENT_REMOVED
      ) {
        const updatedEvents = await eventRepository.find({
          where: { guildId },
          relations: ['players'],
          cache: false,
        });
        posted.edit(createEmbed(updatedEvents));

        if (leave.result === LEAVE_RESULT.EVENT_REMOVED) {
          // If the event is removed, repost the reactions
          await posted.reactions.removeAll();
          await Promise.all(
            updatedEvents.map(async (event) => {
              await posted.react(event.emoji);
            })
          );
        }
      }
    });

    collector.on('end', async () => {
      await posted.reactions.removeAll();
    });
    return posted;
  } catch (e) {
    logger.error('Something went wrong posting message', e);
  }
  return;
};