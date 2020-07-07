import { getRepository } from 'typeorm';
import { Player } from '../entity/Player';
import { Event } from '../entity/Event';
import logger from '../logger';

export enum EVENT_RESULT {
  CREATED,
  MAX,
  ALREADY_OWNED,
}

export const createEvent = async ({
  guildId,
  name,
  owner,
}: {
  guildId: string;
  name: string;
  owner: string;
}): Promise<EVENT_RESULT> => {
  const playerRepository = getRepository(Player);
  const eventRepository = getRepository(Event);
  const player = await playerRepository.findOne({
    where: { discordId: owner },
  });

  if (!player) {
    throw new Error(
      `Player not found during create event process ID: ${owner}`
    );
  }

  // Check if player already owns an event
  const eventExists = await eventRepository.count({
    where: { guildId, owner: player },
  });
  if (eventExists) {
    // Limiting players to a single event
    logger.info('Player already owns an event');
    return EVENT_RESULT.ALREADY_OWNED;
  }

  const guildEventCount = await eventRepository.count({ where: guildId });

  if (guildEventCount <= 10) {
    const newEvent = new Event({
      guildId,
      name,
      rank: 'iron1',
      owner: player,
      players: [player],
    });
    await eventRepository.save(newEvent);
  } else {
    // Limit server to 10 events for now
    return EVENT_RESULT.MAX;
  }

  return EVENT_RESULT.CREATED;
};

export default createEvent;
