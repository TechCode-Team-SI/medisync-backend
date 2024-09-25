import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ObjectTransformer } from 'src/utils/transformers/object-transformer';
import { Illness } from '../domain/illness';

export class SortIllnessesDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  orderBy: keyof Illness;

  @ApiProperty()
  @IsString()
  order: string;
}

export class FindAllIllnessesDto {
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
  @Transform(ObjectTransformer(SortIllnessesDto))
  @ValidateNested({ each: true })
  @Type(() => SortIllnessesDto)
  sort?: SortIllnessesDto[] | null;
}