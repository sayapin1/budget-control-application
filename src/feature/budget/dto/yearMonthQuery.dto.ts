import { IsInt, IsIn } from 'class-validator';

export class YearMonthQueryDto {
  @IsInt()
  year: number;

  @IsInt()
  @IsIn([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  month: number;
}
