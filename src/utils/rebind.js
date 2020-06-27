import { dbget } from "./dbget";

import { setupAddEmojiCollector } from "../collectors/setup-add-emoji-collector.js";
import { setupRemoveEmojiCollector } from "../collectors/setup-remove-emoji-collector.js";

export const rebind = async function rebind(client, guild) {
  const sql = `
  SELECT channel, message
  FROM settings
  WHERE guild = ?
  `;

  const settings = await dbget(sql, [guild.id]);

  if (!settings || !settings.channel || !settings.message) {
    return;
  }

  const channel = guild.channels.find(
    channel => channel.id === settings.channel
  );

  let bindMessage = "";
  if (channel) {
    await channel.fetchMessages().then(messages => {
      const msgArray = messages.array();

      msgArray.forEach(message => {
        if (message.content.indexOf(settings.message) >= 0) {
          bindMessage = message;
        }
      });
    });
  }

  if (bindMessage) {
    setupAddEmojiCollector(bindMessage);
    setupRemoveEmojiCollector(client, bindMessage);
  }
};
