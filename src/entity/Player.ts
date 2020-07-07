import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Event } from './Event';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  public id: number;
  @Column()
  public name: string;
  @Column('text')
  public discordId: string;
  @Column()
  public rank: string;

  @ManyToOne(() => Event, (event) => event.players, { onDelete: 'SET NULL' })
  public joinedEvent: Event;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  constructor(init?: Partial<Player>) {
    Object.assign(this, init);
  }
}
