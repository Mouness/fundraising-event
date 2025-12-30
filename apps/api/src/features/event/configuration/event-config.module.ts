import { Module, Global } from '@nestjs/common';
import { EventConfigService } from './event-config.service';
import { DatabaseModule } from '../../../database/database.module';

@Global()
@Module({
    imports: [DatabaseModule],
    providers: [EventConfigService],
    exports: [EventConfigService],
})
export class EventConfigModule { }
