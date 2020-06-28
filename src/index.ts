// Emoji collectors
// import { setupAddEmojiCollector } from './collectors/setup-add-emoji-collector.js';
// import { setupRemoveEmojiCollector } from './collectors/setup-remove-emoji-collector.js';

import Discord, { TextChannel } from 'discord.js';
import config from './config';

// Actions / supporting
import { createEvent, EVENT_RESULT } from './actions/create';
import { getEventsDetails } from './actions/report';
import { joinEvent, JOIN_RESULT } from './actions/join';
import { leaveEvent } from './actions/leave';
import { createConnection } from 'typeorm';
import createPlayer from './utils/create-player';

const client = new Discord.Client();
const prefix = config.general.commandPrefix;

client.on('ready', async () => {
  if (client.user) {
    client.user.setUsername(config.general.botUsername);
  }

  console.log('Ready');
});

client.on('error', async () => {
  // Add error logging
});

client.on('message', async (msg) => {
  // const isAuthorized = isMod(msg);
  // Possible commands:
  // - create
  // - kick
  // - leave
  // - delete
  // - groups

  if (!msg.member || !msg.guild) {
    console.log('Member or guild missing from message data');
    return;
  }

  if (msg.content.startsWith(`${prefix} create`)) {
    const eventName = msg.content.split(' ').slice(2).join('-');

    await createPlayer({
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
      name: msg.member.displayName,
      discordId: msg.member.id,
      rank: 'iron1',
    });

    const didJoin = await joinEvent({
      guildId: msg.guild.id,
      discordId: msg.member.id,
      emoji: emoji.toString(),
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
      discordId: msg.member.id,
    });
    msg.channel.send(response.msg);
  }
});

createConnection();
client.login(config.general.botToken);
console.log('Logged in');
