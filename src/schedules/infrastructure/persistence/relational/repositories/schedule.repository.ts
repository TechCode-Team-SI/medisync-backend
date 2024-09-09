import { Injectable, Inject, NotFoundException, Scope } from '@nestjs/common';
import {
  Repository,
  FindOptionsRelations,
  DataSource,
  FindOneOptions,
} from 'typeorm';
import { scheduleEntity } from '../entities/schedule.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { schedule } from '../../../../domain/schedule';
import { scheduleRepository } from '../../schedule.repository';
import { scheduleMapper } from '../mappers/schedule.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { exceptionResponses } from 'src/schedules/schedules.messages';
import { PaginationResponseDto } from 'src/utils/dto/pagination-response.dto';
import { Pagination } from 'src/utils/pagination';
import { findOptions } from 'src/utils/types/fine-options.type';
import { Request } from 'express';
import { BaseRepository } from 'src/common/base.repository';
import { REQUEST } from '@nestjs/core';
import { formatOrder } from 'src/utils/utils';
import { SortschedulesDto } from 'src/schedules/dto/find-all-schedules.dto';

@Injectable({ scope: Scope.REQUEST })
export class scheduleRelationalRepository
  extends BaseRepository
  implements scheduleRepository
{
  constructor(
    datasource: DataSource,
    @Inject(REQUEST)
    request: Request,
  ) {
    super(datasource, request);
  }

  private get scheduleRepository(): Repository<scheduleEntity> {
    return this.getRepository(scheduleEntity);
  }

  private relations: FindOptionsRelations<scheduleEntity> = {};

  async create(data: schedule): Promise<schedule> {
    const persistenceModel = scheduleMapper.toPersistence(data);
    const newEntity = await this.scheduleRepository.save(
      this.scheduleRepository.create(persistenceModel),
    );
    return scheduleMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
    options,
    sortOptions,
  }: {
    paginationOptions: IPaginationOptions;
    options?: findOptions;
    sortOptions?: SortschedulesDto[] | null;
  }): Promise<PaginationResponseDto<schedule>> {
    let order: FindOneOptions<scheduleEntity>['order'] = {};
    if (sortOptions) order = formatOrder(sortOptions);

    let relations = this.relations;
    if (options?.minimal) relations = {};

    const [entities, count] = await this.scheduleRepository.findAndCount({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      relations,
      order,
    });
    const items = entities.map((entity) => scheduleMapper.toDomain(entity));

    return Pagination(
      { items, count },
      {
        limit: paginationOptions.limit,
        page: paginationOptions.page,
        domain: 'schedules',
      },
    );
  }

  async findById(
    id: schedule['id'],
    options?: findOptions,
  ): Promise<NullableType<schedule>> {
    let relations = this.relations;
    if (options?.minimal) relations = {};

    const entity = await this.scheduleRepository.findOne({
      where: { id },
      relations,
    });

    return entity ? scheduleMapper.toDomain(entity) : null;
  }

  async update(
    id: schedule['id'],
    payload: Partial<schedule>,
  ): Promise<schedule> {
    const entity = await this.scheduleRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException(exceptionResponses.NotFound);
    }

    const updatedEntity = await this.scheduleRepository.save(
      this.scheduleRepository.create(
        scheduleMapper.toPersistence({
          ...scheduleMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return scheduleMapper.toDomain(updatedEntity);
  }

  async remove(id: schedule['id']): Promise<void> {
    await this.scheduleRepository.delete(id);
  }
}
