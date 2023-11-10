import { IsInt, IsOptional } from 'class-validator';

export class CreateBudgetDto {
  @IsInt()
  @IsOptional()
  food?: number;

  @IsInt()
  @IsOptional()
  transport?: number;

  @IsInt()
  @IsOptional()
  living?: number;

  @IsInt()
  @IsOptional()
  hobby?: number;

  @IsInt()
  @IsOptional()
  culture?: number;

  @IsInt()
  @IsOptional()
  health?: number;

  @IsInt()
  @IsOptional()
  shopping?: number;

  @IsInt()
  @IsOptional()
  education?: number;

  @IsInt()
  @IsOptional()
  saving?: number;

  @IsInt()
  @IsOptional()
  etc?: number;

  @IsInt()
  @IsOptional()
  total?: number;
}
