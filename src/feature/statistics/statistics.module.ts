import { Module } from '@nestjs/common';
import { Expense } from '../../entity/expense.entity';
import { Budget } from '../../entity/budget.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { StatisticsLib } from './statisticsLib';
import { ExpenseModule } from '../expense/expense.module';
import { UtilModule } from '../../util/util.module';
import { BudgetModule } from '../budget/budget.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, Budget]),
    ExpenseModule,
    UtilModule,
    BudgetModule,
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService, StatisticsLib],
  exports: [StatisticsLib],
})
export class StatisticsModule {}
