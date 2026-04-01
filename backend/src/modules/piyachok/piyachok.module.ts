import { Module } from '@nestjs/common';
import { PiyachokController } from './piyachok.controller';
import { PiyachokService } from './piyachok.service';

@Module({
  controllers: [PiyachokController],
  providers: [PiyachokService],
})
export class PiyachokModule {}
