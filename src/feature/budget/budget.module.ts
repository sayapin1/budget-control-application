import { Module } from '@nestjs/common';
import { Budget } from '../../entity/budget.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetController } from './budget.controller';
import { BudgetService } from './budget.service';
import { BudgetLib } from './budgetLib';
import { StatisticsModule } from '../statistics/statistics.module';

@Module({
  imports: [TypeOrmModule.forFeature([Budget]), StatisticsModule],
  controllers: [BudgetController],
  providers: [BudgetService, BudgetLib],
  exports: [BudgetLib],
})
export class BudgetModule {}
