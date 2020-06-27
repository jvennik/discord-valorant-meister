import { dball } from "../utils/dball";


const getEventsDetailsSql = `
  SELECT e.name, e.emoji, (
    SELECT group_concat(p.name)
      FROM events_players AS ep
      JOIN players AS p ON ep.player_id = p.id
      WHERE ep.event_id = e.id
  ) AS players
  FROM events AS e
  WHERE e.guild = ?
`;


export const getEventsDetails = async function getEventsDetails(guildId, channel) {
  let events = await dball(getEventsDetailsSql, [guildId]);

  const fields = [];
  events.forEach((event, index) => {
    const number = event.players.split(",").length;
    const players = event.players.split(",").join(", ");

    fields.push({
      name: `${event.emoji} ${event.name}`,
      value: `${number}/5 - ${players}`
    });
  });

  const msg = {embed: {
    color: 3447003,
    author: {
      name: "ValorantMeister"
    },
    title: "Active events",
    description: "Click the corresponding group number reaction to join/queue",
    fields: fields,
    timestamp: new Date()
  }}

  const posted = await channel.send(msg).catch(err => {
    console.error(err);
    console.error("Failed to post message");
  });

  events.forEach(event => {
    posted.react(event.emoji);
  });
};
