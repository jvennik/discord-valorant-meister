import { getRepository } from 'typeorm';
import { Player } from '../entity/Player';
import { Event } from '../entity/Event';
import logger from '../logger';

const numberToEmoji = {
  0: '0️⃣',
  1: '1️⃣',
  2: '2️⃣',
  3: '3️⃣',
  4: '4️⃣',
  5: '5️⃣',
  6: '6️⃣',
  7: '7️⃣',
  8: '8️⃣',
  9: '9️⃣',
  10: '🔟',
};

export enum EVENT_RESULT {
  CREATED,
  MAX,
  ALREADY_OWNED,
}

export const createEvent = async function createEvent({
  guildId,
  name,
  owner,
}: {
  guildId: string;
  name: string;
  owner: string;
}): Promise<EVENT_RESULT> {
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
  const newEventNumber = guildEventCount as keyof typeof numberToEmoji;

  if (newEventNumber <= 10) {
    const emoji = numberToEmoji[newEventNumber];
    const newEvent = new Event({
      guildId,
      name,
      emoji,
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
