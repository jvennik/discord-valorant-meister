import { getRepository } from 'typeorm';
import { Player } from '../entity/Player';
import { Event } from '../entity/Event';
import logger from '../logger';

const ranks = [
  'iron1',
  'iron2',
  'iron3',
  'bronze1',
  'bronze2',
  'bronze3',
  'silver1',
  'silver2',
  'silver3',
  'gold1',
  'gold2',
  'gold3',
  'platinum1',
  'platinum2',
  'platinum3',
  'diamond1',
  'diamond2',
  'diamond3',
  'valorant1',
  'valorant2',
  'valorant3',
];

const rankMinIndex = 0;
const rankMaxIndex = ranks.length - 1;

export enum JOIN_RESULT {
  JOINED,
  OUT_OF_RANK_RANGE,
  EVENT_DOES_NOT_EXIST,
  ALREADY_JOINED,
  OTHER_EVENT,
}

export const joinEvent = async function joinEvent({
  guildId,
  discordId,
  emoji,
}: {
  guildId: string;
  discordId: string;
  emoji: string;
}): Promise<JOIN_RESULT> {
  const playerRepository = getRepository(Player);
  const eventRepository = getRepository(Event);
  const player = await playerRepository.findOne({
    where: { discordId },
    relations: ['joinedEvent'],
  });

  if (!player) {
    throw new Error('Player data not found when trying to join event');
  }

  const event = await eventRepository.findOne({
    where: { emoji, guildId },
    relations: ['players'],
  });

  if (!event) {
    logger.info('Event does not exist');
    return JOIN_RESULT.EVENT_DOES_NOT_EXIST;
  }

  if (player?.joinedEvent) {
    logger.info('Player in event already!');
    return JOIN_RESULT.ALREADY_JOINED;
  }

  const rankIndex = ranks.indexOf(event.rank);

  let minIndex = rankMinIndex;
  if (rankIndex - 6 > rankMinIndex) {
    minIndex = rankIndex - 6;
  }

  let maxIndex = rankMaxIndex;
  if (rankIndex + 7 < rankMaxIndex) {
    maxIndex = rankIndex + 7;
  }

  const rankRange = ranks.slice(minIndex, maxIndex);

  if (rankRange.indexOf(player.rank) < 0) {
    logger.info('Player rank not in range!');
    return JOIN_RESULT.OUT_OF_RANK_RANGE;
  }

  event.players = [...event.players, player];
  await eventRepository.save(event);
  return JOIN_RESULT.JOINED;
};

export default joinEvent;
