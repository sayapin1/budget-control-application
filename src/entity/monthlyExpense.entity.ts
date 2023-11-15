import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('monthly_expense')
export class MonthlyExpense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  month: string;

  @Column()
  totalExpense: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
