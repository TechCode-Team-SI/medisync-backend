import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleEntity } from '../entities/article.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Article } from '../../../../domain/article';
import { ArticleRepository } from '../../article.repository';
import { ArticleMapper } from '../mappers/article.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { exceptionResponses } from 'src/articles/articles.messages';
import { PaginationResponseDto } from 'src/utils/dto/pagination-response.dto';
import { Pagination } from 'src/utils/pagination';
import { findOptions } from 'src/utils/types/fine-options.type';

@Injectable()
export class ArticleRelationalRepository implements ArticleRepository {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
  ) {}

  private relations = ['updatedBy'];

  async create(data: Article): Promise<Article> {
    const persistenceModel = ArticleMapper.toPersistence(data);
    const newEntity = await this.articleRepository.save(
      this.articleRepository.create(persistenceModel),
    );
    return ArticleMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
    options,
  }: {
    paginationOptions: IPaginationOptions;
    options?: findOptions;
  }): Promise<PaginationResponseDto<Article>> {
    let relations = this.relations;
    if (options?.minimal) relations = [];

    const [entities, count] = await this.articleRepository.findAndCount({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      relations,
    });
    const items = entities.map((entity) => ArticleMapper.toDomain(entity));

    return Pagination(
      { items, count },
      {
        limit: paginationOptions.limit,
        page: paginationOptions.page,
        domain: 'articles',
      },
    );
  }

  async findById(
    id: Article['id'],
    options?: findOptions,
  ): Promise<NullableType<Article>> {
    let relations = this.relations;
    if (options?.minimal) relations = [];

    const entity = await this.articleRepository.findOne({
      where: { id },
      relations,
    });

    return entity ? ArticleMapper.toDomain(entity) : null;
  }

  async update(id: Article['id'], payload: Partial<Article>): Promise<Article> {
    const entity = await this.articleRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException(exceptionResponses.NotFound);
    }

    const updatedEntity = await this.articleRepository.save(
      this.articleRepository.create(
        ArticleMapper.toPersistence({
          ...ArticleMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return ArticleMapper.toDomain(updatedEntity);
  }

  async remove(id: Article['id']): Promise<void> {
    await this.articleRepository.delete(id);
  }
}
