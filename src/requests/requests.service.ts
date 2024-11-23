import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DiagnosticsService } from 'src/diagnostics/diagnostics.service';
import { CreateDiagnosticDto } from 'src/diagnostics/dto/create-diagnostic.dto';
import { Selection } from 'src/field-questions/domain/selection';
import { FieldQuestionTypeEnum } from 'src/field-questions/field-questions.enum';
import { CreateInstructionsDto } from 'src/instructions/dto/create-instructions.dto';
import { InstructionsService } from 'src/instructions/instructions.service';
import { RequestTemplatesService } from 'src/request-templates/request-templates.service';
import { SpecialtyRepository } from 'src/specialties/infrastructure/persistence/specialty.repository';
import { UserPatient } from 'src/user-patients/domain/user-patient';
import { UserPatientsService } from 'src/user-patients/user-patients.service';
import { User } from 'src/users/domain/user';
import { UsersService } from 'src/users/users.service';
import { findOptions } from 'src/utils/types/fine-options.type';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Request } from './domain/request';
import { RequestValue } from './domain/request-value';
import { CreateRequestWithReferenceDto } from './dto/create-request-with-reference.dto';
import { CreateRequestDto } from './dto/create-request.dto';
import { FilterRequestDto, SortRequestDto } from './dto/find-all-requests.dto';
import { FinishRequestDto } from './dto/finish-request.dto';
import { RequestRepository } from './infrastructure/persistence/request.repository';
import { RequestStatusEnum } from './requests.enum';
import { exceptionResponses } from './requests.messages';
@Injectable()
export class RequestsService {
  constructor(
    private readonly requestRepository: RequestRepository,
    private readonly requestTemplateService: RequestTemplatesService,
    private readonly specialtiesRepository: SpecialtyRepository,
    private readonly usersService: UsersService,
    private readonly userPatientsService: UserPatientsService,
    private readonly diagnosticsService: DiagnosticsService,
    private readonly instructionsService: InstructionsService,
  ) {}

  async create(
    createRequestDto: CreateRequestDto &
      Pick<Partial<CreateRequestWithReferenceDto>, 'referredContent'>,
    madeById: string,
    options: { shouldBeSameAsUser: boolean } = { shouldBeSameAsUser: true },
  ) {
    const {
      requestTemplate,
      requestedSpecialty,
      requestValues,
      requestedMedic,
      referredContent,
    } = createRequestDto;
    const { madeFor, ...data } = createRequestDto;

    const foundUser = await this.usersService.findById(madeById, {
      withUserPatients: true,
    });

    if (!foundUser) {
      throw new UnprocessableEntityException(
        exceptionResponses.CurrentUserNotExists,
      );
    }

    const foundUserPatient = await this.userPatientsService.findOne(madeFor.id);
    if (!foundUserPatient) {
      throw new UnprocessableEntityException(
        exceptionResponses.PatientNotExists,
      );
    }
    if (options.shouldBeSameAsUser) {
      const userPatient = foundUser.userPatients?.find(
        (patient) => patient.id === madeFor.id,
      );

      if (!userPatient) {
        throw new UnprocessableEntityException(
          exceptionResponses.PatientNotAllowed,
        );
      }
    }

    const foundRequestTemplate = await this.requestTemplateService.findOne(
      requestTemplate.id,
    );
    if (!foundRequestTemplate) {
      throw new UnprocessableEntityException(
        exceptionResponses.RequestTemplateNotExists,
      );
    }

    let medic: User | undefined;

    const foundSpecialty = await this.specialtiesRepository.findById(
      requestedSpecialty.id,
      { minimal: true },
    );
    if (!foundSpecialty) {
      throw new UnprocessableEntityException(
        exceptionResponses.SpecialtyNotExists,
      );
    }
    if (!foundSpecialty.isGroup) {
      if (!requestedMedic) {
        throw new BadRequestException(exceptionResponses.MedicNotRequested);
      }
      const foundMedic = await this.usersService.findById(requestedMedic.id, {
        withProfile: true,
        withSpecialty: true,
      });
      if (!foundMedic) {
        throw new UnprocessableEntityException(
          exceptionResponses.MedicNotExists,
        );
      }
      if (!foundMedic.employeeProfile) {
        throw new UnprocessableEntityException(
          exceptionResponses.SelectedMedicNotAllowed,
        );
      }
      const isMedicInRequestedSpecialty =
        foundMedic.employeeProfile.specialties?.some(
          (specialty) => specialty.id === requestedSpecialty.id,
        );
      if (!isMedicInRequestedSpecialty) {
        throw new UnprocessableEntityException(
          exceptionResponses.SelectedMedicNotAllowed,
        );
      }
      medic = foundMedic;
    }

    const requestValuesUpdated = foundRequestTemplate.fields.reduce<
      RequestValue[]
    >((acc, { fieldQuestion }) => {
      const data = requestValues.find(
        (value) => value.fieldQuestion.id === fieldQuestion.id,
      );
      if (!data) {
        if (fieldQuestion.isRequired) {
          throw new UnprocessableEntityException(
            exceptionResponses.InvalidAnswer,
          );
        }
        return acc;
      }

      const requestValue = new RequestValue();
      requestValue.fieldQuestion = fieldQuestion;

      switch (fieldQuestion.type) {
        case FieldQuestionTypeEnum.SELECTION:
          if (!data.selections) {
            throw new UnprocessableEntityException(
              exceptionResponses.InvalidAnswer,
            );
          }
          const isMultiple = fieldQuestion.selectionConfig?.isMultiple;
          if (!isMultiple) {
            if (data.selections.length !== 1) {
              throw new UnprocessableEntityException(
                exceptionResponses.InvalidAnswer,
              );
            }
            const selectionId = data.selections[0].id;
            const selection = new Selection();
            selection.id = selectionId;
            requestValue.selections = [selection];
          } else {
            const selections = data.selections.map((selection) => {
              const selectionId = selection.id;
              const currentSelection = new Selection();
              currentSelection.id = selectionId;
              return currentSelection;
            });
            requestValue.selections = selections;
          }
          break;
        case FieldQuestionTypeEnum.NUMBER:
          if (isNaN(Number(data.value))) {
            throw new UnprocessableEntityException(
              exceptionResponses.InvalidAnswer,
            );
          }
          requestValue.value = data.value;
          break;
        case FieldQuestionTypeEnum.TEXT:
        default:
          requestValue.value = data.value;
      }

      return [...acc, requestValue];
    }, []);

    const clonedPayload = {
      ...data,
      patientFullName: foundUserPatient.fullName,
      patientDNI: foundUserPatient.dni,
      patientAddress: foundUserPatient.address || 'N/A',
      status: RequestStatusEnum.PENDING,
      requestTemplate: foundRequestTemplate,
      requestedSpecialty: foundSpecialty,
      requestedMedic: medic,
      requestValues: requestValuesUpdated,
      referredContent: referredContent,
      referredBy: referredContent ? foundUser : undefined,
      madeFor: foundUserPatient,
      madeBy: foundUser,
    };

    return this.requestRepository.create(clonedPayload);
  }

  findAllMinimalWithPagination({
    paginationOptions,
    filterOptions,
    sortOptions,
  }: {
    paginationOptions: IPaginationOptions;
    filterOptions?: (FilterRequestDto & { includeGroup?: boolean }) | null;
    sortOptions?: SortRequestDto[] | null;
  }) {
    return this.requestRepository.findAllMinimalWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
      filterOptions,
      sortOptions,
    });
  }

  findOneDetailed(id: Request['id']) {
    return this.requestRepository.findByIdFormatted(id);
  }

  findOne(
    id: Request['id'],
    options?: findOptions & {
      withSpecialty?: boolean;
      withMedic?: boolean;
      withmadeFor?: boolean;
    },
  ) {
    return this.requestRepository.findById(id, options);
  }

  findRating(id: Request['id']) {
    return this.requestRepository.findRating(id);
  }

  updateStatus(id: Request['id'], status: RequestStatusEnum) {
    return this.requestRepository.update(id, { status });
  }

  updateStatusBySpecialty(specialtyId: string, status: RequestStatusEnum) {
    return this.requestRepository.updateStatusBySpecialty(specialtyId, status);
  }

  async updateSaveData(id: Request['id'], userId: string, savedToId: string) {
    const foundUser = await this.usersService.findById(userId, {
      withUserPatients: true,
    });
    if (!foundUser) {
      throw new UnprocessableEntityException(
        exceptionResponses.CurrentUserNotExists,
      );
    }
    const foundUserPatient = foundUser.userPatients?.find(
      (patient) => patient.id === savedToId,
    );
    if (!foundUserPatient) {
      throw new UnprocessableEntityException(
        exceptionResponses.PatientNotAllowed,
      );
    }
    const userPatient = new UserPatient();
    userPatient.id = savedToId;
    return this.requestRepository.update(id, {
      savedTo: userPatient,
    });
  }

  async attend(requestId: string, medicId: string) {
    const request = await this.requestRepository.findById(requestId, {
      withMedic: true,
      withSpecialty: true,
    });
    if (!request) {
      throw new NotFoundException(exceptionResponses.NotFound);
    }
    if (request.requestedSpecialty.isGroup) {
      const isValidMedic =
        await this.specialtiesRepository.isUserInSpecialty(medicId);
      if (!isValidMedic) {
        throw new ForbiddenException(exceptionResponses.CurrentMedicNotAllowed);
      }
    } else {
      if (request.requestedMedic?.id !== medicId) {
        throw new ForbiddenException(exceptionResponses.CurrentMedicNotAllowed);
      }
    }

    if (request.status !== RequestStatusEnum.PENDING) {
      throw new UnprocessableEntityException(
        exceptionResponses.StatusNotPending,
      );
    }

    return this.updateStatus(requestId, RequestStatusEnum.ATTENDING);
  }

  async cancel(
    requestId: string,
    userId: string,
    options: { cancelledBy: 'user' | 'medic' } = { cancelledBy: 'user' },
  ) {
    const request = await this.requestRepository.findById(requestId, {
      withMedic: true,
      withSpecialty: true,
      withMadeBy: true,
    });
    if (!request) {
      throw new NotFoundException(exceptionResponses.NotFound);
    }

    if (options.cancelledBy === 'medic') {
      if (request.requestedSpecialty.isGroup) {
        const isValidMedic =
          await this.specialtiesRepository.isUserInSpecialty(userId);
        if (!isValidMedic) {
          throw new ForbiddenException(
            exceptionResponses.CurrentMedicNotAllowed,
          );
        }
      } else {
        if (request.requestedMedic?.id !== userId) {
          throw new ForbiddenException(
            exceptionResponses.CurrentMedicNotAllowed,
          );
        }
      }
    } else if (options.cancelledBy === 'user') {
      if (request.madeBy.id !== userId) {
        throw new ForbiddenException(exceptionResponses.CurrentUserNotAllowed);
      }
    }

    if (request.status !== RequestStatusEnum.PENDING) {
      throw new UnprocessableEntityException(
        exceptionResponses.StatusNotPending,
      );
    }

    return this.updateStatus(requestId, RequestStatusEnum.CANCELLED);
  }

  async finish(
    requestId: string,
    medicId: string,
    finishRequestDto: FinishRequestDto,
  ) {
    const request = await this.requestRepository.findById(requestId, {
      withSpecialty: true,
      withMedic: true,
    });
    if (!request) {
      throw new NotFoundException(exceptionResponses.NotFound);
    }
    if (request.requestedSpecialty.isGroup) {
      const isValidMedic =
        await this.specialtiesRepository.isUserInSpecialty(medicId);
      if (!isValidMedic) {
        throw new ForbiddenException(exceptionResponses.CurrentMedicNotAllowed);
      }
    } else {
      if (request.requestedMedic?.id !== medicId) {
        throw new ForbiddenException(exceptionResponses.CurrentMedicNotAllowed);
      }
    }

    if (request.status !== RequestStatusEnum.ATTENDING) {
      throw new UnprocessableEntityException(
        exceptionResponses.StatusNotAttending,
      );
    }
    const specialty = await this.specialtiesRepository.findById(
      request.requestedSpecialty.id,
      {
        minimal: true,
      },
    );
    if (!specialty) {
      throw new UnprocessableEntityException(
        exceptionResponses.SpecialtyNotExists,
      );
    }

    const createDiagnosticDto: CreateDiagnosticDto = {
      description: finishRequestDto.diagnostic.description,
      request,
      specialty,
      illnesses: finishRequestDto.diagnostic.illnesses,
      injuries: finishRequestDto.diagnostic.injuries,
      symptoms: finishRequestDto.diagnostic.symptoms,
      treatments: finishRequestDto.diagnostic.treatments,
      pathologies: finishRequestDto.diagnostic.pathologies,
    };

    const createInstructionsDto: CreateInstructionsDto = {
      description: finishRequestDto.instructions,
      request,
      specialty,
    };

    await this.diagnosticsService.create(createDiagnosticDto, medicId);
    await this.instructionsService.create(createInstructionsDto, medicId);
    return this.updateStatus(requestId, RequestStatusEnum.COMPLETED);
  }
}
