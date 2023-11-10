import { Module } from '@nestjs/common';
import { Expense } from '../../entity/expense.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

@Module({
  imports: [TypeOrmModule.forFeature([Expense])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
