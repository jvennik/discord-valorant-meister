import { getRepository } from 'typeorm';
import { Player } from '../entity/Player';

export const bumpMember = async ({
  memberId,
}: {
  memberId: string;
}): Promise<void> => {
  try {
    const playerRepository = getRepository(Player);
    const player = await playerRepository.findOneOrFail({
      where: { discordId: memberId },
    });

    // Because we are not actually changing any values for this player, we will forcefully update
    // the field here with the current time
    player.updatedAt = new Date();

    // We resave the player to foce it to update the last updated timestamp
    await playerRepository.save(player);
  } catch (e) {
    throw new Error('Could not find matching player with provided ID');
  }
};
