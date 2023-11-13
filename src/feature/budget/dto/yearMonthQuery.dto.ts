import { IsIn, IsString } from 'class-validator';

export class YearMonthQueryDto {
  @IsString()
  year: string;

  @IsString()
  @IsIn(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'])
  month: string;
}
