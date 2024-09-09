import { PaginationResponseDto } from 'src/utils/dto/pagination-response.dto';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { schedule } from '../../domain/schedule';
import { findOptions } from 'src/utils/types/fine-options.type';
import { BaseRepository } from 'src/common/base.repository';
import { SortschedulesDto } from 'src/schedules/dto/find-all-schedules.dto';

export abstract class scheduleRepository extends BaseRepository {
  abstract create(
    data: Omit<schedule, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<schedule>;

  abstract findAllWithPagination({
    paginationOptions,
    options,
  }: {
    paginationOptions: IPaginationOptions;
    options?: findOptions;
    sortOptions?: SortschedulesDto[] | null;
  }): Promise<PaginationResponseDto<schedule>>;

  abstract findById(
    id: schedule['id'],
    options?: findOptions,
  ): Promise<NullableType<schedule>>;

  abstract update(
    id: schedule['id'],
    payload: DeepPartial<schedule>,
  ): Promise<schedule | null>;

  abstract remove(id: schedule['id']): Promise<void>;
}
