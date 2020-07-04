import { getRepository } from 'typeorm';
import { Guild } from '../entity/Guild';
import createGuild from '../utils/create-guild';

export enum UNBIND_RESULT {
  SUCCESS,
  NOT_BOUND,
}

export const unbind = async ({
  guildId,
}: {
  guildId: string;
}): Promise<UNBIND_RESULT> => {
  try {
    const guildRepository = getRepository(Guild);
    const guild = await createGuild({ guildId });

    if (!guild.boundChannelId) {
      return UNBIND_RESULT.NOT_BOUND;
    }

    guild.boundChannelId = null;
    await guildRepository.save(guild);
    return UNBIND_RESULT.SUCCESS;
  } catch (e) {
    throw e;
  }
};
