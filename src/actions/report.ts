import { TextChannel, MessageReaction } from 'discord.js';
import { getRepository } from 'typeorm';
import { Event } from '../entity/Event';
import { createEmbed } from '../utils/create-embed';
import joinEvent, { JOIN_RESULT } from './join';
import leaveEvent, { LEAVE_RESULT } from './leave';

export const getEventsDetails = async function getEventsDetails({
  guildId,
  channel,
}: {
  guildId: string;
  channel: TextChannel;
}): Promise<void> {
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

    collector.on('remove', async (_reaction, user) => {
      console.log('removed');
      const leave = await leaveEvent({
        discordId: user.id,
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
  } catch (e) {
    console.error('Something went wrong posting message', e);
  }
};
