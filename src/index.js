// Utils
import { guildDelete } from "./utils/guilddelete";
import { isMod } from "./utils/permissions";
import { rebind } from "./utils/rebind";

// DB imports
import { DBCreate } from "./utils/dbcreate";
import { dbget } from "./utils/dbget";
import { run } from "./utils/dbrun";

// Emoji collectors
import { setupAddEmojiCollector } from "./collectors/setup-add-emoji-collector.js";
import { setupRemoveEmojiCollector } from "./collectors/setup-remove-emoji-collector.js";

// Setup config & Discord client
const config = require("config");
const Discord = require("discord.js");

// Actions / supporting
import { createPlayer } from "./utils/create-player";
import { createEvent } from "./actions/create";
import { getEventsDetails } from "./actions/report";
import { joinEvent } from "./actions/join";
import { leaveEvent } from "./actions/leave";

const client = new Discord.Client();
const prefix = config.general.commandPrefix;

client.on("ready", async () => {
  client.user.setUsername(config.general.botUsername);
  await DBCreate();

  console.log("Ready");
});

client.on("error", async () => {
  // Add error logging
});

client.on("guildDelete", async guild => {
  console.log("Deleting guild: " + guild.name);
  await guildDelete(guild.id);
});

client.on("message", async msg => {
  const isAuthorized = isMod(msg);
  // Possible commands:
  // - create
  // - kick
  // - leave
  // - delete
  // - groups

  if (msg.content.startsWith(`${prefix} create`)) {
    const eventName = msg.content.split(" ").slice(2).join("-");
    await createPlayer(msg.guild.id, msg.member.displayName, msg.member.id, "iron1");
    const response = await createEvent(msg.guild.id, eventName, msg.member.id);
    if (response === "created") {
      msg.channel.send(`Created event: ${eventName}`);
    } else if (response === "alreadyOwned") {
      msg.channel.send(`${msg.member.displayName}, you already own an event`);
    } else if (response === "max") {
      msg.channel.send(`${msg.member.displayName}, sorry max number of events reached`);
    }
  };

  if (msg.content.startsWith(`${prefix} list`)) {
    await getEventsDetails(msg.guild.id, msg.channel);
  }

  if (msg.content.startsWith(`${prefix} join`)) {
    const emoji = msg.content.split(" ").slice(-1);
    await createPlayer(msg.guild.id, msg.member.displayName, msg.member.id, "iron1");
    const didJoin = await joinEvent(msg.guild.id, msg.member.id, emoji);

    if (didJoin === "joined") {
      msg.channel.send(`${msg.member.displayName} joined a group`);
    } else if (didJoin === "already") {
      msg.channel.send(`${msg.member.displayName} you're already in the event doofus`);
    } else if (didJoin === "other") {
      msg.channel.send(`${msg.member.displayName}, leave your other event first before joining another`);
    } else {
      msg.channel.send(`${msg.member.displayName} your rank is not compatible with the chosen event`);
    }
  }

  if (msg.content.startsWith(`${prefix} leave`)) {
    const response = await leaveEvent(msg.guild.id, msg.member.id);
    msg.channel.send(response);
  }
});

client.login(config.general.botToken);
console.log("Logged in");
