import { Event } from '../entity/Event';
import { Player } from '../entity/Player';
import { getRepository } from 'typeorm';

export enum TRANSFER_RESULT {
  NOT_IN_EVENT,
  EVENT_TRANSFERRED,
  NOT_OWNER,
  PLAYER_NOT_FOUND,
}

export const transferEvent = async ({
  discordId,
  guildId,
  targetId,
}: {
  discordId: string;
  guildId: string;
  targetId: string;
}): Promise<{ result: TRANSFER_RESULT; msg: string }> => {
  const playerRepository = getRepository(Player);
  const eventRepository = getRepository(Event);

  const player = await playerRepository.findOne({
    where: { discordId },
    relations: ['joinedEvent', 'joinedEvent.owner', 'joinedEvent.players'],
  });

  if (!player) {
    throw new Error('Player data missing when calling disband event');
  }

  if (!player.joinedEvent || player.joinedEvent.guildId !== guildId) {
    return {
      result: TRANSFER_RESULT.NOT_IN_EVENT,
      msg: 'You are not currently in an event.',
    };
  }

  // Find target player
  const targetPlayer = player.joinedEvent.players.find(
    (p) => p.discordId === targetId
  );

  if (!targetPlayer) {
    return {
      result: TRANSFER_RESULT.PLAYER_NOT_FOUND,
      msg: 'Cannot transfer ownership to a player not in this event.',
    };
  }

  if (player.joinedEvent.owner.id === player.id) {
    // OK to transfer event
    player.joinedEvent.owner = targetPlayer;
    await eventRepository.save(player.joinedEvent);
    return {
      result: TRANSFER_RESULT.EVENT_TRANSFERRED,
      msg: `**${player.joinedEvent.name}** ownership has been transferred to: **<@!${targetId}>**.`,
    };
  } else {
    return {
      result: TRANSFER_RESULT.NOT_OWNER,
      msg: 'Only the owner of an event can transfer ownership.',
    };
  }
};

export default transferEvent;
