import { Controller, Get } from '@nestjs/common';
import { TopCategoriesService } from './top-categories.service';

@Controller('top-categories')
export class TopCategoriesController {
  constructor(private readonly topCategoriesService: TopCategoriesService) {}

  @Get()
  findAll() {
    return this.topCategoriesService.findAllPublic();
  }
}
