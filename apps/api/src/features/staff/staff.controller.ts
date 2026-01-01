import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StaffService } from './staff.service';

@Controller('staff')
@UseGuards(AuthGuard('jwt'))
export class StaffController {
    constructor(private readonly staffService: StaffService) { }

    @Get()
    findAll() {
        return this.staffService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.staffService.findOne(id);
    }

    @Post()
    create(@Body() data: { name: string; code: string }) {
        return this.staffService.create(data);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() data: { name?: string; code?: string },
    ) {
        return this.staffService.update(id, data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.staffService.remove(id);
    }
}
