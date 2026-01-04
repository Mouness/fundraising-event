import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Patch,
  Body,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { WhiteLabelingService } from './white-labeling.service';

@Controller()
export class WhiteLabelingController {
  constructor(private readonly service: WhiteLabelingService) {}

  @Get('settings/global')
  async getGlobalSettings() {
    return this.service.getGlobalSettings();
  }

  @Patch('settings/global')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async updateGlobalSettings(@Body() config: any) {
    return this.service.updateGlobalSettings(config);
  }

  @Get('events/:slug/settings')
  async getEventSettings(@Param('slug') slug: string) {
    const settings = await this.service.getEventSettings(slug);
    if (!settings) {
      throw new NotFoundException(`Event settings for '${slug}' not found`);
    }
    return settings;
  }

  @Patch('events/:id/branding')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async updateEventSettings(@Param('id') eventId: string, @Body() config: any) {
    return this.service.updateEventSettings(eventId, config);
  }

  @Delete('events/:id/branding')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async resetEventSettings(@Param('id') eventId: string) {
    return this.service.resetEventSettings(eventId);
  }
}
