import { Module } from '@nestjs/common';
import { AnalyticsService } from '../admin/analytics.service';
import { InstitutionsController } from './institutions.controller';
import { InstitutionsService } from './institutions.service';
import { OptionalJwtAuthGuard } from './optional-jwt.guard';

@Module({
  controllers: [InstitutionsController],
  providers: [InstitutionsService, OptionalJwtAuthGuard, AnalyticsService],
  exports: [InstitutionsService],
})
export class InstitutionsModule {}
