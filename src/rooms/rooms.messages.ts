import { HttpStatus } from '@nestjs/common';
import { HTTPErrorMessage } from 'src/utils/types/http-error-message.type';

export const exceptionResponses: HTTPErrorMessage = {
  NotFound: {
    status: HttpStatus.NOT_FOUND,
    error: 'rooms_not_found',
    message: 'Room not found',
  },
  SpecialtyNotExist: {
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    error: 'specialty_not_exist',
    message: 'Specialty not exist',
  },
  EmployeeProfileNotExist: {
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    error: 'employee_profile_not_exist',
    message: 'Employee profile not exist',
  },
  UsingEmployeeAndSpecialty: {
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    error: 'using_employee_and_specialty',
    message: 'Using Employee and Specialty',
  },
} as const;
