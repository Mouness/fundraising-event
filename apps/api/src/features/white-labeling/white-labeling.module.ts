import { Module } from '@nestjs/common';
import { WhiteLabelingController } from './white-labeling.controller';
import { WhiteLabelingService } from './white-labeling.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [WhiteLabelingController],
  providers: [WhiteLabelingService],
  exports: [WhiteLabelingService],
})
export class WhiteLabelingModule {}
