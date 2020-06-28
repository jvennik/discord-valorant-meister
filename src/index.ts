// Utils
import { guildDelete } from './utils/guilddelete';

// DB imports
import { DBCreate } from './utils/dbcreate';

// Emoji collectors
// import { setupAddEmojiCollector } from './collectors/setup-add-emoji-collector.js';
// import { setupRemoveEmojiCollector } from './collectors/setup-remove-emoji-collector.js';

// Setup config & Discord client
import config from 'config';
import Discord, { TextChannel } from 'discord.js';

// Actions / supporting
import { createPlayer } from './utils/create-player';
import { createEvent, EVENT_RESULT } from './actions/create';
import { getEventsDetails } from './actions/report';
import { joinEvent, JOIN_RESULT } from './actions/join';
import { leaveEvent } from './actions/leave';

const client = new Discord.Client();
const prefix = config.get('general.commandPrefix');

client.on('ready', async () => {
  client.user.setUsername(config.get('general.botUsername'));
  await DBCreate();

  console.log('Ready');
});

client.on('error', async () => {
  // Add error logging
});

client.on('guildDelete', async (guild) => {
  console.log('Deleting guild: ' + guild.name);
  await guildDelete(guild.id);
});

client.on('message', async (msg) => {
  // const isAuthorized = isMod(msg);
  // Possible commands:
  // - create
  // - kick
  // - leave
  // - delete
  // - groups

  if (msg.content.startsWith(`${prefix} create`)) {
    const eventName = msg.content.split(' ').slice(2).join('-');
    await createPlayer({
      guildId: msg.guild.id,
      name: msg.member.displayName,
      discordId: msg.member.id,
      rank: 'iron1',
    });
    const response = await createEvent({
      guildId: msg.guild.id,
      name: eventName,
      owner: msg.member.id,
    });
    if (response === EVENT_RESULT.CREATED) {
      msg.channel.send(`Created event: ${eventName}`);
    } else if (response === EVENT_RESULT.ALREADY_OWNED) {
      msg.channel.send(`${msg.member.displayName}, you already own an event`);
    } else if (response === EVENT_RESULT.MAX) {
      msg.channel.send(
        `${msg.member.displayName}, sorry max number of events reached`
      );
    }
  }

  if (msg.content.startsWith(`${prefix} list`)) {
    if (msg.channel instanceof TextChannel) {
      await getEventsDetails({ guildId: msg.guild.id, channel: msg.channel });
    }
  }

  if (msg.content.startsWith(`${prefix} join`)) {
    const emoji = msg.content.split(' ').slice(-1);
    await createPlayer({
      guildId: msg.guild.id,
      name: msg.member.displayName,
      discordId: msg.member.id,
      rank: 'iron1',
    });
    const didJoin = await joinEvent({
      guildId: msg.guild.id,
      discordId: msg.member.id,
      emoji,
    });

    if (didJoin === JOIN_RESULT.JOINED) {
      msg.channel.send(`${msg.member.displayName} joined a group`);
    } else if (didJoin === JOIN_RESULT.ALREADY_JOINED) {
      msg.channel.send(
        `${msg.member.displayName} you're already in the event doofus`
      );
    } else if (didJoin === JOIN_RESULT.OTHER_EVENT) {
      msg.channel.send(
        `${msg.member.displayName}, leave your other event first before joining another`
      );
    } else {
      msg.channel.send(
        `${msg.member.displayName} your rank is not compatible with the chosen event`
      );
    }
  }

  if (msg.content.startsWith(`${prefix} leave`)) {
    const response = await leaveEvent({
      guildId: msg.guild.id,
      discordId: msg.member.id,
    });
    msg.channel.send(response);
  }
});

client.login(config.get('general.botToken'));
console.log('Logged in');
