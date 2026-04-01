import { Module } from '@nestjs/common';
import { InstitutionsModule } from '../institutions/institutions.module';
import { AdminController } from './admin.controller';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [InstitutionsModule],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard, AnalyticsService],
})
export class AdminModule {}
