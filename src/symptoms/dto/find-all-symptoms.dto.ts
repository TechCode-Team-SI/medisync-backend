import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { OrderEnum } from 'src/common/order.enum';
import { ApiFilterProperty } from 'src/utils/decorators/filter-property';
import { ApiSortProperty } from 'src/utils/decorators/sort-property';
import { ObjectTransformer } from 'src/utils/transformers/object-transformer';

export class SortSymptomsDto {
  @ApiSortProperty({ enum: ['createdAt', 'name'] })
  @Type(() => String)
  @IsString()
  orderBy: string;

  @ApiSortProperty({ enum: OrderEnum })
  @IsString()
  order: string;
}

export class FilterSymptomsDto {
  //Search by name
  @ApiFilterProperty({ description: 'Search by name' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class FindAllSymptomsDto {
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

  @ApiPropertyOptional({ type: () => SortSymptomsDto, isArray: true })
  @IsOptional()
  @Transform(ObjectTransformer(SortSymptomsDto))
  @ValidateNested({ each: true })
  @Type(() => SortSymptomsDto)
  sort?: SortSymptomsDto[] | null;

  @ApiPropertyOptional({ type: () => FilterSymptomsDto })
  @IsOptional()
  @IsObject()
  @Transform(ObjectTransformer(FilterSymptomsDto))
  @ValidateNested()
  @Type(() => FilterSymptomsDto)
  filters?: FilterSymptomsDto | null;
}
