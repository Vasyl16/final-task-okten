import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const frontendOrigin = configService.get<string>(
    'app.frontendOrigin',
    'http://localhost:5173',
  );

  app.enableCors({
    origin: frontendOrigin,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  const port = configService.get<number>('app.port', 3000);

  // Required behind Docker/nginx (bind all interfaces — not only localhost)
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
