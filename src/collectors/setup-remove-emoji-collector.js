import { dbget } from "../utils/dbget";

export const setupRemoveEmojiCollector = async function setupRemoveEmojiCollector(
  client,
  msg
) {
  const sql = `
  SELECT initial_role, grant_role, channel, message
  FROM settings
  WHERE guild = ?
  `;
  const settings = await dbget(sql, [msg.guild.id]);

  client.on("messageReactionRemove", (reaction, user) => {
    const messageMatches = reaction.message.content.indexOf(settings.message) >= 0;
    const channelMatches = reaction.message.channel.id === settings.channel;
    const emojiMatches = reaction.emoji.name === "✅";
    if (messageMatches && channelMatches && emojiMatches) {
      if (!user.bot) {
        const member = msg.guild.member(user.id);
        if (member !== null) {
          const grantRole = msg.guild.roles.find(
            role => role.id === settings.initial_role
          );

          const removeRole = msg.guild.roles.find(
            role => role.id === settings.grant_role
          );

          member.addRole(grantRole).catch(err => {
            console.error("Failed to grant initial_role");
            console.error(err);
          });

          member.removeRole(removeRole).catch(err => {
            console.error("Failed to remove membership");
            console.error(err);
          });
        }
      }
    }
  });
};

export default setupRemoveEmojiCollector;
