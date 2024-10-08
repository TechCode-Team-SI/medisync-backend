import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import { RequestEntity } from '../entities/request.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Request } from '../../../../domain/request';
import { RequestRepository } from '../../request.repository';
import { RequestMapper } from '../mappers/request.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { exceptionResponses } from 'src/requests/requests.messages';
import { PaginationResponseDto } from 'src/utils/dto/pagination-response.dto';
import { Pagination } from 'src/utils/pagination';
import { findOptions } from 'src/utils/types/fine-options.type';
import { RequestFormatted } from 'src/requests/domain/request-formatted';

@Injectable()
export class RequestRelationalRepository implements RequestRepository {
  constructor(
    @InjectRepository(RequestEntity)
    private readonly requestRepository: Repository<RequestEntity>,
  ) {}

  private relations: FindOptionsRelations<RequestEntity> = {
    requestValues: {
      fieldQuestion: {
        selectionConfig: true,
      },
      selections: true,
    },
    requestedSpecialty: true,
    requestedMedic: true,
    requestTemplate: {
      fields: {
        fieldQuestion: {
          selectionConfig: true,
          selections: true,
        },
      },
    },
  };

  async create(data: Request): Promise<Request> {
    const persistenceModel = RequestMapper.toPersistence(data);
    const newEntity = await this.requestRepository.save(
      this.requestRepository.create(persistenceModel),
    );
    return RequestMapper.toDomain(newEntity);
  }

  async findAllMinimalWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<PaginationResponseDto<Request>> {
    const [entities, count] = await this.requestRepository.findAndCount({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });
    const items = entities.map((entity) => RequestMapper.toDomain(entity));

    return Pagination(
      { items, count },
      {
        limit: paginationOptions.limit,
        page: paginationOptions.page,
        domain: 'requests',
      },
    );
  }

  async findById(
    id: Request['id'],
    options?: findOptions & { withSpecialty?: boolean; withMedic?: boolean },
  ): Promise<NullableType<Request>> {
    let relations = this.relations;
    if (options) relations = {};
    if (options?.withSpecialty) {
      relations = {
        ...relations,
        requestedSpecialty: true,
      };
    }
    if (options?.withSpecialty) {
      relations = {
        ...relations,
        requestedMedic: true,
      };
    }
    if (options?.minimal) relations = {};

    const entity = await this.requestRepository.findOne({
      where: { id },
      relations,
    });

    return entity ? RequestMapper.toDomain(entity) : null;
  }

  async findByIdFormatted(
    id: Request['id'],
  ): Promise<NullableType<RequestFormatted>> {
    const relations = this.relations;

    const entity = await this.requestRepository.findOne({
      where: { id },
      relations,
    });

    return entity ? RequestMapper.toFormatted(entity) : null;
  }

  async update(id: Request['id'], payload: Partial<Request>): Promise<Request> {
    const entity = await this.requestRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException(exceptionResponses.NotFound);
    }

    const updatedEntity = await this.requestRepository.save(
      this.requestRepository.create(
        RequestMapper.toPersistence({
          ...RequestMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return RequestMapper.toDomain(updatedEntity);
  }

  async remove(id: Request['id']): Promise<void> {
    await this.requestRepository.delete(id);
  }
}
