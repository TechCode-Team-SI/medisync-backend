import { CreateInstructionsDto } from 'src/instructions/dto/create-instructions.dto';
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { exceptionResponses } from 'src/requests/requests.messages';
import { getPagination } from 'src/utils/get-pagination';
import {
  PaginationResponse,
  PaginationResponseDto,
} from '../utils/dto/pagination-response.dto';
import { Request } from './domain/request';
import { CreateRequestDto } from './dto/create-request.dto';
import { FindAllRequestsDto } from './dto/find-all-requests.dto';
import { RequestsService } from './requests.service';
import { FinishRequestDto } from './dto/finish-request.dto';
import { RequestStatusEnum } from './requests.enum';
import { DiagnosticsService } from 'src/diagnostics/diagnostics.service';
import { Me } from 'src/auth/auth.decorator';
import { JwtPayloadType } from 'src/auth/strategies/types/jwt-payload.type';
import { InstructionsService } from 'src/instructions/instructions.service';
import { CreateDiagnosticDto } from 'src/diagnostics/dto/create-diagnostic.dto';
import { SpecialtiesService } from 'src/specialties/specialties.service';

@ApiTags('Requests')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'requests',
  version: '1',
})
export class RequestsController {
  constructor(
    private readonly requestsService: RequestsService,
    private readonly diagnosticsService: DiagnosticsService,
    private readonly instructionsService: InstructionsService,
    private readonly specialtiesService: SpecialtiesService,
  ) {}

  @Post()
  @ApiCreatedResponse({
    type: Request,
  })
  create(@Body() createRequestDto: CreateRequestDto) {
    return this.requestsService.create(createRequestDto);
  }

  @Get()
  @ApiOkResponse({
    type: PaginationResponse(Request),
  })
  findAll(
    @Query() query: FindAllRequestsDto,
  ): Promise<PaginationResponseDto<Request>> {
    const paginationOptions = getPagination(query);

    return this.requestsService.findAllMinimalWithPagination({
      paginationOptions,
    });
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Request,
  })
  async findOne(@Param('id') id: string) {
    const entity = await this.requestsService.findOneDetailed(id);

    if (!entity) {
      throw new NotFoundException(exceptionResponses.NotFound);
    }

    return entity;
  }

  @Patch(':id')
  @ApiOkResponse({
    type: Request,
  })
  async finish(
    @Me() userPayload: JwtPayloadType,
    @Body() body: FinishRequestDto,
    @Param('id') id: string,
  ) {
    const request = await this.requestsService.findOne(id, {
      withSpecialty: true,
    });
    if (!request) {
      throw new NotFoundException(exceptionResponses.NotFound);
    }
    if (request.requestedMedic.id !== userPayload.id) {
      throw new ForbiddenException(exceptionResponses.CurrentMedicNotAllowed);
    }
    const specialty = await this.specialtiesService.findOne(
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
      description: body.diagnostic,
      request,
      specialty,
    };

    const createInstructionsDto: CreateInstructionsDto = {
      description: body.instructions,
      request,
      specialty,
    };

    await this.diagnosticsService.create(createDiagnosticDto, userPayload.id);
    await this.instructionsService.create(
      createInstructionsDto,
      userPayload.id,
    );
    return this.requestsService.finish(id, RequestStatusEnum.COMPLETED);
  }
}
