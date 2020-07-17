import { getRepository } from 'typeorm';
import { Player } from '../entity/Player';

export const createPlayer = async function createPlayer({
  name,
  discordId,
  rank,
  relations,
}: {
  name: string;
  discordId: string;
  rank: string;
  // Optional relations to query for
  relations?: string[];
}): Promise<Player> {
  try {
    const playerRepository = getRepository(Player);
    const player = await playerRepository.findOne({
      where: { discordId },
      relations,
    });

    if (!player) {
      const newPlayer = new Player({
        name,
        discordId,
        rank,
      });
      await playerRepository.save(newPlayer);
      return newPlayer;
    }

    return player;
  } catch (e) {
    throw e;
  }
};

export default createPlayer;
