import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, StaffLoginDto } from '@fundraising/types';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('staff/login')
  async staffLogin(@Body() staffLoginDto: StaffLoginDto) {
    const staff = await this.authService.validateStaff(
      staffLoginDto.code,
      staffLoginDto.eventId,
    );
    if (!staff) {
      throw new UnauthorizedException('Invalid staff code');
    }
    return this.authService.loginStaff(staff);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // The AuthGuard('google') intercepts the request and redirects to Google.
    // This function body is intentionally empty and will not be reached.
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req) {
    const user = await this.authService.validateGoogleUser(req.user);
    if (!user) {
      throw new UnauthorizedException('Unauthorized Google Account');
    }
    return this.authService.login(user); // Returns JWT
  }
}
