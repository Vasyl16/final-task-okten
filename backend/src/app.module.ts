import { Module } from '@nestjs/common';
import { StorageModule } from './common/storage/storage.module';
import { AdminModule } from './modules/admin/admin.module';
import { AppConfigModule } from './config/app-config.module';
import { AuthModule } from './modules/auth/auth.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { InstitutionsModule } from './modules/institutions/institutions.module';
import { NewsModule } from './modules/news/news.module';
import { PiyachokModule } from './modules/piyachok/piyachok.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { TopCategoriesModule } from './modules/top-categories/top-categories.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    AdminModule,
    AppConfigModule,
    StorageModule,
    PrismaModule,
    AuthModule,
    FavoritesModule,
    UsersModule,
    InstitutionsModule,
    NewsModule,
    PiyachokModule,
    ReviewsModule,
    TopCategoriesModule,
  ],
})
export class AppModule {}
