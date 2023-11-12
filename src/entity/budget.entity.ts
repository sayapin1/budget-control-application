import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  month!: string;

  @Column({ nullable: true })
  food?: number;

  @Column({ nullable: true })
  transport?: number;

  @Column({ nullable: true })
  living?: number;

  @Column({ nullable: true })
  hobby?: number;

  @Column({ nullable: true })
  culture?: number;

  @Column({ nullable: true })
  health?: number;

  @Column({ nullable: true })
  shopping?: number;

  @Column({ nullable: true })
  education?: number;

  @Column({ nullable: true })
  saving?: number;

  @Column({ nullable: true })
  etc?: number;

  @Column()
  total!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
