import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Get,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, StaffLoginDto } from '@fundraising/types';
import { GoogleAuthUser } from './providers/auth-provider.interface';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
  @Throttle({ default: { limit: 10, ttl: 60000 } })
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
  async googleAuth() {
    // The AuthGuard('google') intercepts the request and redirects to Google.
    // This function body is intentionally empty and will not be reached.
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const user = await this.authService.validateGoogleUser(req.user);
    if (!user) {
      throw new UnauthorizedException('Unauthorized Google Account');
    }
    const { accessToken, user: loggedInUser } = this.authService.login(user);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const token = encodeURIComponent(accessToken);
    const userData = encodeURIComponent(JSON.stringify(loggedInUser));

    return res.redirect(
      `${frontendUrl}/auth/success?token=${token}&user=${userData}`,
    );
  }
}

interface AuthenticatedRequest extends Request {
  user: GoogleAuthUser;
}
