import { dbget } from './dbget';
import Event from '../models/Event';

const getEventSql = `
  SELECT id FROM events WHERE guild = ? AND owner = ?;
`;

export const getEvent = async function getEvent({
  guildId,
  owner,
}: {
  guildId: string;
  owner: string;
}): Promise<Event> {
  try {
    const event = await dbget<Event>({
      sql: getEventSql,
      params: [guildId, owner],
    });

    return event;
  } catch (e) {
    console.error('Something went wrong grabbing an event', e);
    throw new Error(e);
  }
};

export default getEvent;
