import { Module } from '@nestjs/common'
import { EventsService } from './events.service'
import { EventsController } from './events.controller'
import { DatabaseModule } from '../../database/database.module'
import { WhiteLabelingModule } from '../white-labeling/white-labeling.module'

@Module({
    imports: [DatabaseModule, WhiteLabelingModule],
    controllers: [EventsController],
    providers: [EventsService],
    exports: [EventsService],
})
export class EventsModule {}
