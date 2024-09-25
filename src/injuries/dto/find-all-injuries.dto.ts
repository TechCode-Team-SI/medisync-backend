import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ObjectTransformer } from 'src/utils/transformers/object-transformer';
import { Injury } from '../domain/injury';

export class SortInjuriesDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  orderBy: keyof Injury;

  @ApiProperty()
  @IsString()
  order: string;
}

export class FindAllInjuriesDto {
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
  @Transform(ObjectTransformer(SortInjuriesDto))
  @ValidateNested({ each: true })
  @Type(() => SortInjuriesDto)
  sort?: SortInjuriesDto[] | null;
}