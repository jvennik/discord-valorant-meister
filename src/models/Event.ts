import Player from './Player';

export default interface Event {
  id: string;
  guild: string;
  name: string;
  owner: string;
  emoji: string;
  players: string;
}
