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

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.eventsService.findOne(slug);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Get(':id/staff')
  @UseGuards(AuthGuard('jwt'))
  findStaff(@Param('id') id: string) {
    return this.eventsService.findStaff(id);
  }

  @Post(':id/staff/:staffId')
  @UseGuards(AuthGuard('jwt'))
  assignStaff(
    @Param('id') id: string,
    @Param('staffId') staffId: string,
  ) {
    return this.eventsService.assignStaff(id, staffId);
  }

  @Delete(':id/staff/:staffId')
  @UseGuards(AuthGuard('jwt'))
  unassignStaff(@Param('id') id: string, @Param('staffId') staffId: string) {
    return this.eventsService.unassignStaff(id, staffId);
  }
}
