import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { genderEnum } from 'src/employee-profiles/employee-profiles.enum';
import { UserPatientFamilyRelationship } from '../user-patients.enum';

export class CreateUserPatientDto {
  @ApiProperty({ example: '27317962', type: String })
  @IsNotEmpty()
  dni: string;

  @ApiProperty({ example: 'Fernando', type: String })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ example: 'Av. Venezuela', type: String })
  @IsOptional()
  @IsString()
  address?: string | null;

  @ApiProperty({ example: 'F', type: String })
  @IsNotEmpty()
  @IsEnum(genderEnum)
  gender: genderEnum;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(UserPatientFamilyRelationship)
  familyRelationship: UserPatientFamilyRelationship;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  birthday: Date;
}
