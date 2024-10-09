import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ObjectTransformer } from 'src/utils/transformers/object-transformer';
import { Treatment } from '../domain/treatment';

export class SortTreatmentsDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  orderBy: keyof Treatment;

  @ApiProperty()
  @IsString()
  order: string;
}

export class FilterTreatmentsDto {
  //Search by name
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

export class FindAlltreatmentsDto {
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
  @Transform(ObjectTransformer(SortTreatmentsDto))
  @ValidateNested({ each: true })
  @Type(() => SortTreatmentsDto)
  sort?: SortTreatmentsDto[] | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsObject()
  @Transform(ObjectTransformer(FilterTreatmentsDto))
  @ValidateNested()
  @Type(() => FilterTreatmentsDto)
  filters?: FilterTreatmentsDto | null;
}
