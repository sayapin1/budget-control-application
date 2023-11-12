import { Module } from '@nestjs/common';
import { Expense } from '../../entity/expense.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyController } from './daily.controller';
import { DailyService } from './daily.service';
import { StatisticsModule } from '../statistics/statistics.module';

@Module({
  imports: [TypeOrmModule.forFeature([Expense]), StatisticsModule],
  controllers: [DailyController],
  providers: [DailyService],
})
export class DailyModule {}
