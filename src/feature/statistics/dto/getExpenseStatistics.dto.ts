import { StatisticsType } from '../../../enum/statisticsType.enum';
import { IsEnum } from 'class-validator';

export class GetExpenseStatisticsDto {
  @IsEnum(StatisticsType)
  type!: StatisticsType;
}
