import { Controller, Get, Query } from '@nestjs/common';
import { ListPublicTopCategoriesQueryDto } from './dto/list-public-top-categories-query.dto';
import { TopCategoriesService } from './top-categories.service';

@Controller('top-categories')
export class TopCategoriesController {
  constructor(private readonly topCategoriesService: TopCategoriesService) {}

  @Get()
  findAll(@Query() query: ListPublicTopCategoriesQueryDto) {
    return this.topCategoriesService.findAllPublic(query);
  }
}
