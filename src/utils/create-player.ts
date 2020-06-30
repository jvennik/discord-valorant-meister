import { getRepository } from 'typeorm';
import { Player } from '../entity/Player';
import logger from '../logger';

export const createPlayer = async function createPlayer({
  name,
  discordId,
  rank,
}: {
  name: string;
  discordId: string;
  rank: string;
}): Promise<void> {
  try {
    const playerRepository = getRepository(Player);
    const playerExists = await playerRepository.count({
      where: { discordId },
    });

    if (!playerExists) {
      const newPlayer = new Player({
        name,
        discordId,
        rank,
      });
      await playerRepository.save(newPlayer);
    }
  } catch (e) {
    logger.error('Something went wrong creating a player', e);
  }
};

export default createPlayer;
