import { Message, MessageReaction } from 'discord.js';
import { Event } from '../entity/Event';
import { createEmbed } from './create-embed';
import joinEvent, { JOIN_RESULT } from '../actions/join';
import { getRepository } from 'typeorm';
import { Player } from '../entity/Player';
import leaveEvent, { LEAVE_RESULT } from '../actions/leave';
import { Guild } from '../entity/Guild';

export const addReactionCollector = async (
  msg: Message,
  events: Event[]
): Promise<void> => {
  if (!msg.guild) {
    throw new Error(
      'Guild missing from message when trying to mount reaction controller'
    );
  }
  const eventRepository = getRepository(Event);
  const guildRepository = getRepository(Guild);
  const guild = await guildRepository.findOne({ guildId: msg.guild.id });
  await Promise.all(
    events.map(async (event) => {
      await msg.react(event.emoji);
    })
  );

  const emojiFilter = (reaction: MessageReaction): boolean =>
    events.some((e) => e.emoji === reaction.emoji.name);

  const collector = msg.createReactionCollector(emojiFilter, {
    time: 1000 * 60 * 30,
    dispose: true,
  });

  collector.on('collect', async (reaction, user) => {
    if (!msg.guild) {
      throw new Error('Guild missing from message');
    }

    // If the reaction is from the bot, ignore it
    if (msg.author.bot) {
      return;
    }

    const joinResult = await joinEvent({
      guildId: msg.guild.id,
      discordId: user.id,
      emoji: reaction.emoji.name,
    });

    if (joinResult === JOIN_RESULT.JOINED) {
      const updatedEvents = await eventRepository.find({
        where: { guildId: msg.guild.id },
        relations: ['players'],
        cache: false,
      });
      msg.edit(createEmbed(updatedEvents));
    }
  });

  collector.on('remove', async (reaction, user) => {
    if (!msg.guild) {
      throw new Error('Guild missing from message in collector remove');
    }
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
      guildId: msg.guild.id,
    });

    if (
      leave.result === LEAVE_RESULT.LEFT_EVENT ||
      leave.result === LEAVE_RESULT.TRANSFERRED ||
      leave.result === LEAVE_RESULT.EVENT_REMOVED
    ) {
      const updatedEvents = await eventRepository.find({
        where: { guildId: msg.guild.id },
        relations: ['players'],
        cache: false,
      });
      msg.edit(createEmbed(updatedEvents));

      if (leave.result === LEAVE_RESULT.EVENT_REMOVED) {
        // If the event is removed, repost the reactions
        await msg.reactions.removeAll();
        await Promise.all(
          updatedEvents.map(async (event) => {
            await msg.react(event.emoji);
          })
        );
      }
    }
  });

  collector.on('end', async () => {
    await msg.reactions.removeAll();

    if (guild && guild.boundMessageId === msg.id) {
      const updatedEvents = await eventRepository.find({
        where: { guildId: guild.guildId },
        relations: ['players'],
        cache: false,
      });
      await addReactionCollector(msg, updatedEvents);
    }
  });
};
