import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { TransformPasswordPipe } from './transform-password.pipe';
import { Req } from '@nestjs/common';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // register controller
  @UsePipes(ValidationPipe, TransformPasswordPipe)
  @HttpCode(200)
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  // login controller
  @HttpCode(200)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  // detail user
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async profile(@Req() req: any) {
    const id = req.user.sub;
    const user = await this.authService.getUserById(id);
    return {
      statusCode: 200,
      user,
    };
  }
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.authService.logout(token);
  }
}
