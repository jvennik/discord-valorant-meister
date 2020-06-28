import {
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  Entity,
} from 'typeorm';
import { Player } from './Player';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  @Column()
  public emoji: string;

  @Column()
  public guildId: string;

  @Column()
  public rank: string;

  @OneToOne(() => Player)
  @JoinColumn()
  public owner: Player;

  @OneToMany(() => Player, (player) => player.joinedEvent)
  public players: Player[];
}
