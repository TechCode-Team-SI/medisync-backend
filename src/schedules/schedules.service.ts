import { Injectable } from '@nestjs/common';
import { CreatescheduleDto } from './dto/create-schedule.dto';
import { UpdatescheduleDto } from './dto/update-schedule.dto';
import { scheduleRepository } from './infrastructure/persistence/schedule.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { schedule } from './domain/schedule';
import { findOptions } from 'src/utils/types/fine-options.type';
import { SortschedulesDto } from 'src/schedules/dto/find-all-schedules.dto';

@Injectable()
export class schedulesService {
  constructor(private readonly scheduleRepository: scheduleRepository) {}

  create(createscheduleDto: CreatescheduleDto) {
    return this.scheduleRepository.create(createscheduleDto);
  }

  findAllWithPagination({
    paginationOptions,
    options,
    sortOptions,
  }: {
    paginationOptions: IPaginationOptions;
    options?: findOptions;
    sortOptions?: SortschedulesDto[] | null;
  }) {
    return this.scheduleRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
      options,
      sortOptions,
    });
  }

  findOne(id: schedule['id'], options?: findOptions) {
    return this.scheduleRepository.findById(id, options);
  }

  update(id: schedule['id'], updatescheduleDto: UpdatescheduleDto) {
    return this.scheduleRepository.update(id, updatescheduleDto);
  }

  remove(id: schedule['id']) {
    return this.scheduleRepository.remove(id);
  }
}
