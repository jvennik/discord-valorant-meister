import { getRepository } from 'typeorm';
import { Event } from '../entity/Event';
import { Player } from '../entity/Player';

export enum DISBAND_RESULT {
  NOT_IN_EVENT,
  EVENT_REMOVED,
  NOT_OWNER,
}

export const disbandEvent = async ({
  discordId,
  guildId,
}: {
  discordId: string;
  guildId: string;
}): Promise<{ result: DISBAND_RESULT; msg: string }> => {
  const playerRepository = getRepository(Player);
  const eventRepository = getRepository(Event);

  const player = await playerRepository.findOne({
    where: { discordId },
    relations: ['joinedEvent', 'joinedEvent.owner'],
  });

  if (!player) {
    throw new Error('Player data missing when calling disband event');
  }

  if (!player.joinedEvent || player.joinedEvent.guildId !== guildId) {
    return {
      result: DISBAND_RESULT.NOT_IN_EVENT,
      msg: 'You are not currently in an event.',
    };
  }

  if (player.joinedEvent.owner.id === player.id) {
    await eventRepository.delete(player.joinedEvent.id);
    return {
      result: DISBAND_RESULT.EVENT_REMOVED,
      msg: `**${player.joinedEvent.name}** has been removed.`,
    };
  } else {
    return {
      result: DISBAND_RESULT.NOT_OWNER,
      msg: `You cannot disband an event you do not own.`,
    };
  }
};

export default disbandEvent;
