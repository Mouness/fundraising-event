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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { StaffService } from './staff.service';
import { CreateStaffDto, UpdateStaffDto } from '@fundraising/types';

@Controller('staff')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) { }

  /**
   * Get all staff members.
   */
  @Get()
  findAll() {
    return this.staffService.findAll();
  }

  /**
   * Get a specific staff member by ID.
   * @param id - Staff ID.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  /**
   * Create a new staff member (Admin only).
   * @param data - Staff creation data.
   */
  @Post()
  @Roles('ADMIN')
  create(@Body() data: CreateStaffDto) {
    return this.staffService.create(data);
  }

  /**
   * Update a staff member (Admin only).
   * @param id - Staff ID.
   * @param data - Staff update data.
   */
  @Put(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() data: UpdateStaffDto) {
    return this.staffService.update(id, data);
  }

  /**
   * Delete a staff member (Admin only).
   * @param id - Staff ID.
   */
  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }
}
