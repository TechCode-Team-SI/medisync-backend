import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BaseRepository } from 'src/common/base.repository';
import {
  FilterTicketDto,
  SortTicketDto,
} from 'src/tickets/dto/find-all-tickets.dto';
import { exceptionResponses } from 'src/tickets/tickets.messages';
import { PaginationResponseDto } from 'src/utils/dto/pagination-response.dto';
import { Pagination } from 'src/utils/pagination';
import { findOptions } from 'src/utils/types/fine-options.type';
import { formatOrder } from 'src/utils/utils';
import {
  DataSource,
  FindOneOptions,
  FindOptionsRelations,
  FindOptionsWhere,
  In,
  Like,
  Repository,
} from 'typeorm';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { Ticket } from '../../../../domain/ticket';
import { TicketRepository } from '../../ticket.repository';
import { TicketEntity } from '../entities/ticket.entity';
import { TicketMapper } from '../mappers/ticket.mapper';

@Injectable({ scope: Scope.REQUEST })
export class TicketRelationalRepository
  extends BaseRepository
  implements TicketRepository
{
  constructor(
    datasource: DataSource,
    @Inject(REQUEST)
    request: Request,
  ) {
    super(datasource, request);
  }

  private get ticketRepository(): Repository<TicketEntity> {
    return this.getRepository(TicketEntity);
  }

  private relations: FindOptionsRelations<TicketEntity> = {
    createdBy: {
      roles: false,
    },
    ticketTag: true,
  };

  async create(data: Ticket): Promise<Ticket> {
    const persistenceModel = TicketMapper.toPersistence(data);
    const newEntity = await this.ticketRepository.save(
      this.ticketRepository.create(persistenceModel),
    );
    return TicketMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
    options,
    sortOptions,
    filterOptions,
  }: {
    paginationOptions: IPaginationOptions;
    options?: findOptions & { createdBy: boolean };
    sortOptions?: SortTicketDto[] | null;
    filterOptions?: FilterTicketDto | null;
  }): Promise<PaginationResponseDto<Ticket>> {
    let order: FindOneOptions<TicketEntity>['order'] = { createdAt: 'DESC' };
    if (sortOptions) order = formatOrder(sortOptions);

    let where: FindOptionsWhere<TicketEntity> = {};
    if (filterOptions?.search) {
      where = {
        ...where,
        title: Like(`%${filterOptions.search}%`),
      };
    }
    if (filterOptions?.type) where = { ...where, type: filterOptions.type };
    if (filterOptions?.status)
      where = { ...where, status: filterOptions.status };
    if (filterOptions?.createdByIds)
      where = { ...where, createdBy: { id: In(filterOptions.createdByIds) } };

    let relations = this.relations;
    if (options) relations = {};
    if (options?.createdBy) relations = { createdBy: true };
    if (options?.minimal) relations = {};

    const [entities, count] = await this.ticketRepository.findAndCount({
      where,
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      relations,
      order,
    });
    const items = entities.map((entity) => TicketMapper.toDomain(entity));

    return Pagination(
      { items, count },
      {
        limit: paginationOptions.limit,
        page: paginationOptions.page,
        domain: 'tickets',
      },
    );
  }

  async findById(
    id: Ticket['id'],
    options?: findOptions,
  ): Promise<NullableType<Ticket>> {
    let relations = this.relations;
    if (options?.minimal) relations = {};

    const entity = await this.ticketRepository.findOne({
      where: { id },
      relations,
    });

    return entity ? TicketMapper.toDomain(entity) : null;
  }

  async update(id: Ticket['id'], payload: Partial<Ticket>): Promise<Ticket> {
    const entity = await this.ticketRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException(exceptionResponses.NotFound);
    }

    const updatedEntity = await this.ticketRepository.save(
      this.ticketRepository.create(
        TicketMapper.toPersistence({
          ...TicketMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return TicketMapper.toDomain(updatedEntity);
  }

  async remove(id: Ticket['id']): Promise<void> {
    await this.ticketRepository.delete(id);
  }
}
