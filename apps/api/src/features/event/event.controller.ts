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
import { EventService } from './event.service';
import { CreateEventDto, UpdateEventDto } from '@fundraising/types';
import { AuthGuard } from '@nestjs/passport';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) { }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @Get()
  findAll() {
    return this.eventService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.eventService.findOne(slug);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.update(id, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.eventService.remove(id);
  }
}
