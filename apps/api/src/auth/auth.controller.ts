import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { SetPublic } from 'src/common/decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SetPublic()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Res({ passthrough: true }) res, @Request() req) {
    if (!req.user.isVerified)
      throw new ForbiddenException('User is not verified!');

    if (!req.user.otp || !req.user.otpExpiry || req.user.otpExpiry.getTime() < Date.now())
      throw new ForbiddenException('Invalid or Expired OTP');

    const { accessToken, refreshToken } = await this.authService.login(
      req.user,
    );
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { message: 'Login successful' };
  }

  @SetPublic()
  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return await this.authService.register(registerUserDto);
  }

  @SetPublic()
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Request() req, @Res({ passthrough: true }) res) {
    const userId = req.user.sub;
    const refreshToken = req.user.refreshToken;
    const tokenId = req.user.tokenId;

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refresh(userId, refreshToken, tokenId);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { message: 'Refresh Rotation Succesfull' };
  }

  @SetPublic()
  @Get('verify/:token')
  async verifyUser(
    @Param('token') token: string,
    @Res({ passthrough: true }) res,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.verifyUser(token);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { message: 'User verified succesfully' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async signOut(@Request() req, @Res({ passthrough: true }) res) {
    const refreshToken = req.cookies['refresh-token'];

    if (refreshToken) await this.authService.logout(refreshToken);

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { message: 'Logged Out Succesfully' };
  }

  @Post('logoutall')
  @HttpCode(HttpStatus.OK)
  async logoutAll(@Request() req, @Res({ passthrough: true }) res) {
    const userId = req.user.userId;
    if (userId) await this.authService.logoutAll(userId);

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { message: 'Logged Out From All Devices' };
  }

  @SetPublic()
  @UseGuards(AuthGuard('local'))
  @Post('reverify')
  @HttpCode(HttpStatus.OK)
  async reverify(@Request() req, @Res({ passthrough: true }) res) {
    if (req.user.isVerified)
      throw new BadRequestException('User is already verified!');

    await this.authService.reverify(req.user);

    return { message: 'Email sent successfully' };
  }

  @SetPublic()
  @UseGuards(AuthGuard('local'))
  @Post('sendotp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Request() req) {
    await this.authService.sendOtp(req.user);

    return { message: 'OTP successfully sent!' };
  }
}
