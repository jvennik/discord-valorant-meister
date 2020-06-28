import config from '../config';
import { Message } from 'discord.js';

export const isMod = async function isMod(msg: Message): Promise<boolean> {
  let hasRole = false;
  if (msg.member) {
    config.authorizedRoles.forEach((roleName) => {
      const role = msg.guild.roles.find((role) => role.name === roleName);

      if (msg.member.roles.has(role.toString())) {
        hasRole = true;
      }
    });
  }
  return hasRole;
};

export default isMod;
