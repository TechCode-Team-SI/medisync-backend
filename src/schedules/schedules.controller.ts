import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { schedulesService } from './schedules.service';
import { CreatescheduleDto } from './dto/create-schedule.dto';
import { UpdatescheduleDto } from './dto/update-schedule.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { schedule } from './domain/schedule';
import { AuthGuard } from '@nestjs/passport';
import {
  PaginationResponse,
  PaginationResponseDto,
} from '../utils/dto/pagination-response.dto';
import { FindAllschedulesDto } from './dto/find-all-schedules.dto';
import { exceptionResponses } from 'src/schedules/schedules.messages';
import { getPagination } from 'src/utils/get-pagination';

@ApiTags('Schedules')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'schedules',
  version: '1',
})
export class schedulesController {
  constructor(private readonly schedulesService: schedulesService) {}

  @Post()
  @ApiCreatedResponse({
    type: schedule,
  })
  create(@Body() createscheduleDto: CreatescheduleDto) {
    return this.schedulesService.create(createscheduleDto);
  }

  @Get()
  @ApiOkResponse({
    type: PaginationResponse(schedule),
  })
  async findAll(
    @Query() query: FindAllschedulesDto,
  ): Promise<PaginationResponseDto<schedule>> {
    const paginationOptions = getPagination(query);

    return this.schedulesService.findAllWithPagination({
      paginationOptions,
      sortOptions: query.sort,
    });
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: schedule,
  })
  async findOne(@Param('id') id: string) {
    const entity = await this.schedulesService.findOne(id);

    if (!entity) {
      throw new NotFoundException(exceptionResponses.NotFound);
    }

    return entity;
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: schedule,
  })
  update(
    @Param('id') id: string,
    @Body() updatescheduleDto: UpdatescheduleDto,
  ) {
    return this.schedulesService.update(id, updatescheduleDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.schedulesService.remove(id);
  }
}
