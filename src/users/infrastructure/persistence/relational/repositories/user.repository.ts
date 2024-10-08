import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { FilterUserDto, SortUserDto } from '../../../../dto/query-user.dto';
import { User } from '../../../../domain/user';
import { UserRepository } from '../../user.repository';
import { UserMapper } from '../mappers/user.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { exceptionResponses } from 'src/users/users.messages';
import { PaginationResponseDto } from 'src/utils/dto/pagination-response.dto';
import { Pagination } from 'src/utils/pagination';
import { findOptions } from 'src/utils/types/fine-options.type';

@Injectable()
export class UsersRelationalRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  private relations: FindOptionsRelations<UserEntity> = {
    roles: true,
    employeeProfile: true,
  };

  async create(data: User): Promise<User> {
    const persistenceModel = UserMapper.toPersistence(data);
    const newEntity = await this.usersRepository.save(
      this.usersRepository.create(persistenceModel),
    );
    return UserMapper.toDomain(newEntity);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
    options,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
    options?: findOptions;
  }): Promise<PaginationResponseDto<User>> {
    let relations = this.relations;
    if (options?.minimal) relations = {};

    const where: FindOptionsWhere<UserEntity> = {};
    if (filterOptions?.roles?.length) {
      //TODO: Implement filters later
    }

    const [entities, count] = await this.usersRepository.findAndCount({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      loadEagerRelations: true,
      relations,
      where: where,
      order: sortOptions?.reduce(
        (accumulator, sort) => ({
          ...accumulator,
          [sort.orderBy]: sort.order,
        }),
        {},
      ),
    });
    const items = entities.map((entity) => UserMapper.toDomain(entity));

    return Pagination(
      { items, count },
      { ...paginationOptions, domain: 'users' },
    );
  }

  async findById(
    id: User['id'],
    options?: findOptions & { withProfile?: boolean; withSpecialty?: boolean },
  ): Promise<NullableType<User>> {
    let relations = this.relations;
    if (options) relations = {};
    if (options?.withProfile) {
      relations.employeeProfile = true;
    }
    if (options?.withSpecialty) {
      relations.employeeProfile = {
        specialties: true,
      };
    }
    if (options?.minimal) relations = {};
    const entity = await this.usersRepository.findOne({
      where: { id },
      relations,
    });

    return entity ? UserMapper.toDomain(entity) : null;
  }

  async count(): Promise<number> {
    return this.usersRepository.count();
  }

  async findByEmail(
    email: User['email'],
    options?: findOptions,
  ): Promise<NullableType<User>> {
    let relations = this.relations;
    if (options?.minimal) relations = {};

    const entity = await this.usersRepository.findOne({
      where: { email },
      relations,
    });

    return entity ? UserMapper.toDomain(entity) : null;
  }

  async update(id: User['id'], payload: Partial<User>): Promise<User> {
    const entity = await this.usersRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException(exceptionResponses.NotFound);
    }

    const updatedUser = await this.usersRepository.create(
      UserMapper.toPersistence({
        ...UserMapper.toDomain(entity),
        ...payload,
      }),
    );

    const updatedEntity = await this.usersRepository.save(updatedUser);

    return UserMapper.toDomain(updatedEntity);
  }

  async remove(id: User['id']): Promise<void> {
    await this.usersRepository.softDelete(id);
  }
}
