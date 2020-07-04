import { PrimaryGeneratedColumn, Entity, Column } from 'typeorm';

@Entity()
export class Guild {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public guildId: string;

  @Column({ type: 'varchar', name: 'boundChannelId', nullable: true })
  public boundChannelId?: string | null;

  @Column({ type: 'varchar', name: 'boundMessageId', nullable: true })
  public boundMessageId?: string | null;

  constructor(init?: Partial<Guild>) {
    Object.assign(this, init);
  }
}
