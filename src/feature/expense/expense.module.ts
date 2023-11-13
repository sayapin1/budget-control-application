import { Module } from '@nestjs/common';
import { Expense } from '../../entity/expense.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { ExpenseLib } from './expenseLib';

@Module({
  imports: [TypeOrmModule.forFeature([Expense])],
  controllers: [ExpenseController],
  providers: [ExpenseService, ExpenseLib],
  exports: [ExpenseLib],
})
export class ExpenseModule {}
