import { Module } from '@nestjs/common';
import { TopCategoriesController } from './top-categories.controller';
import { TopCategoriesService } from './top-categories.service';

@Module({
  controllers: [TopCategoriesController],
  providers: [TopCategoriesService],
  exports: [TopCategoriesService],
})
export class TopCategoriesModule {}
