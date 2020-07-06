import { bot } from '../bot/BotController';

export const getPlayerName = (serverId: string, playerId: string): string => {
  const guild = bot.client.guilds.cache.get(serverId);

  const user = guild?.members.cache.get(playerId);

  return user?.displayName ?? 'Unknown User';
};
