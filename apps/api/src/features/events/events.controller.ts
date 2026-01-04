import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from '@fundraising/types';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get('public')
  findPublic() {
    return this.eventsService.findPublic();
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'STAFF')
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.eventsService.findOne(slug);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Get(':id/staff')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'STAFF') // Staff should check their own assignment? Or just Admin? Let's say Admin/Staff.
  findStaff(@Param('id') id: string) {
    return this.eventsService.findStaff(id);
  }

  @Post(':id/staff/:staffId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  assignStaff(@Param('id') id: string, @Param('staffId') staffId: string) {
    return this.eventsService.assignStaff(id, staffId);
  }

  @Delete(':id/staff/:staffId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  unassignStaff(@Param('id') id: string, @Param('staffId') staffId: string) {
    return this.eventsService.unassignStaff(id, staffId);
  }
}
