import { ApiProperty } from '@nestjs/swagger';
import { FieldQuestionTypeEnum } from 'src/field-questions/field-questions.enum';
import { RequestStatusEnum } from '../requests.enum';

export class RequestFormatted {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty()
  patient: Patient;

  @ApiProperty()
  requestedMedic: Medic;

  @ApiProperty()
  requestedSpecialty: Specialty;

  @ApiProperty()
  appointmentHour: string;

  @ApiProperty()
  status: RequestStatusEnum;

  @ApiProperty()
  fields: (TextField | SelectionField)[];

  @ApiProperty()
  createdAt: Date;
}

type Patient = {
  fullName: string;
  dni: string;
  address: string;
};

type Medic = {
  fullName: string;
};

type Specialty = {
  name: string;
};

export type TextField = {
  order: number;
  value: string;
  label: string;
  description?: string | null;
  type: FieldQuestionTypeEnum;
  isRequired: boolean;
};

export type SelectionField = {
  order: number;
  label: string;
  description?: string | null;
  type: FieldQuestionTypeEnum;
  isRequired: boolean;
  selectionConfig: {
    isMultiple: boolean;
  };
  selections: {
    id: string;
    value: string;
    isSelected: boolean;
  }[];
};
