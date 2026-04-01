import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { envValidationSchema } from './env.validation';

const envFiles = [join(process.cwd(), 'config', 'backend'), join(process.cwd(), '.env')].filter(
  (filePath) => existsSync(filePath),
);

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: envFiles.length > 0 ? envFiles : undefined,
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
  ],
  exports: [NestConfigModule],
})
export class AppConfigModule {}
