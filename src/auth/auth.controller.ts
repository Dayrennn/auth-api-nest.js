import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Patch,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { TransformPasswordPipe } from './transform-password.pipe';
import { Req } from '@nestjs/common';
import { RolesGuard } from './role/roles.guard';
import { Roles } from './role/roles.decorator';
import { Role } from './role/roles.enum';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // register controller
  @UsePipes(ValidationPipe, TransformPasswordPipe)
  @HttpCode(200)
  @Post('register')
  // ambil data register dto dan kirim ke service
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  // login controller
  @HttpCode(200)
  @Post('login')
  // ambil data login dari dto dan kirim ke service
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  // detail user
  @UseGuards(JwtAuthGuard) // melindungi agar hanya yang login yang bisa akses
  @Get('profile')
  // ambil data dari client, termasuk header, body, user
  async profile(@Req() req: any) {
    const id = req.user.sub; // otomatis oleh jwt strategy setelah di cek
    const user = await this.authService.getUserById(id);
    return {
      statusCode: 200,
      user, // menampilkan data user
    };
  }

  // logout
  @Post('logout')
  @UseGuards(JwtAuthGuard) // hanya yang login yang bisa akses
  // ambil data client
  async logout(@Req() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', ''); // ambil token jwt
    return this.authService.logout(token); // kirim ke service logout
  }

  // update user, hanya yang login dan role yang sesuai
  @UseGuards(JwtAuthGuard, RolesGuard)
  // memastikan data dto sesuai
  @UsePipes(ValidationPipe)
  @Patch('update-user/:id')
  @Roles(Role.ADMIN) // Hanya admin yang bisa akses
  async updateUser(
    @Req() req: any, // ambil request data user dari jwt
    @Param('id') id: string, // id yang ingin di update
    @Body() dto: UpdateUserDto, // data update dari dto
  ) {
    const currentUser = req.user; // info user dan role yang sedang login
    return await this.authService.updateUser(currentUser, id, dto); // kirim ke service
  }
}
