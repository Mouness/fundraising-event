import { Module, Global } from '@nestjs/common';
import { EventConfigService } from './event-config.service';

@Global()
@Module({
    providers: [EventConfigService],
    exports: [EventConfigService],
})
export class EventConfigModule { }
