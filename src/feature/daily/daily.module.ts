import { Module } from '@nestjs/common';
import { Expense } from '../../entity/expense.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyController } from './daily.controller';
import { DailyService } from './daily.service';

@Module({
  imports: [TypeOrmModule.forFeature([Expense])],
  controllers: [DailyController],
  providers: [DailyService],
})
export class DailyModule {}
