import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ObjectTransformer } from 'src/utils/transformers/object-transformer';
import { schedule } from '../domain/schedule';

export class SortschedulesDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  orderBy: keyof schedule;

  @ApiProperty()
  @IsString()
  order: string;
}

export class FindAllschedulesDto {
  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(ObjectTransformer(SortschedulesDto))
  @ValidateNested({ each: true })
  @Type(() => SortschedulesDto)
  sort?: SortschedulesDto[] | null;
}
