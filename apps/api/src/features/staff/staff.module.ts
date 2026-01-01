import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
    imports: [DatabaseModule],
    providers: [StaffService],
    controllers: [StaffController],
    exports: [StaffService],
})
export class StaffModule { }
