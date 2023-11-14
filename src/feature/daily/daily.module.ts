import { Module } from '@nestjs/common';
import { Expense } from '../../entity/expense.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyController } from './daily.controller';
import { DailyService } from './daily.service';
import { BudgetModule } from '../budget/budget.module';
import { ExpenseModule } from '../expense/expense.module';
import { StatisticsModule } from '../statistics/statistics.module';
import { UtilModule } from '../../util/util.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense]),
    ExpenseModule,
    StatisticsModule,
    BudgetModule,
    UtilModule,
  ],
  controllers: [DailyController],
  providers: [DailyService],
})
export class DailyModule {}
