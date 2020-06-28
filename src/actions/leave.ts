import { getRepository } from 'typeorm';
import { Event } from '../entity/Event';
import { Player } from '../entity/Player';

export enum LEAVE_RESULT {
  LEFT_EVENT,
  NOT_IN_EVENT,
  TRANSFERRED,
  EVENT_REMOVED,
}

export const leaveEvent = async function leaveEvent({
  discordId,
}: {
  discordId: string;
}): Promise<{ result: LEAVE_RESULT; msg: string }> {
  const playerRepository = getRepository(Player);
  const eventRepository = getRepository(Event);
  const player = await playerRepository.findOne({
    where: { discordId },
    relations: ['joinedEvent', 'joinedEvent.players', 'joinedEvent.owner'],
  });

  if (!player) {
    throw new Error('Player data missing when calling leave event');
  }

  if (!player.joinedEvent) {
    return {
      result: LEAVE_RESULT.NOT_IN_EVENT,
      msg: 'You are not currently in an event.',
    };
  }

  if (player.joinedEvent.owner.id === player.id) {
    // Owner is leaving, switch ownership to next player
    if (player.joinedEvent.players.length === 1) {
      await eventRepository.delete(player.joinedEvent.id);
      return {
        result: LEAVE_RESULT.EVENT_REMOVED,
        msg: `**${player.joinedEvent.name}** has been removed`,
      };
    } else {
      const newOwner = player.joinedEvent.players.find(
        (p) => p.id !== player.id
      );
      const newPlayers = player.joinedEvent.players.filter(
        (p) => p.id !== player.id
      );

      if (!newOwner || newPlayers.length === 0) {
        await eventRepository.delete(player.joinedEvent.id);
        return {
          result: LEAVE_RESULT.EVENT_REMOVED,
          msg: `**${player.joinedEvent.name}** has been removed`,
        };
      }
      player.joinedEvent.players = newPlayers;
      player.joinedEvent.owner = newOwner;

      let msg = `**${player.name}** has left event: **${player.joinedEvent.name}**.\n`;
      msg += `Ownership transferred to: **${newOwner.name}**`;
      return { result: LEAVE_RESULT.TRANSFERRED, msg };
    }
  }

  const newPlayers = player.joinedEvent.players.filter(
    (p) => player.id !== p.id
  );
  player.joinedEvent.players = newPlayers;
  await eventRepository.save(player.joinedEvent);
  return {
    result: LEAVE_RESULT.LEFT_EVENT,
    msg: `**${player.name}** has left group: **${player.joinedEvent.name}**`,
  };
};

export default leaveEvent;
