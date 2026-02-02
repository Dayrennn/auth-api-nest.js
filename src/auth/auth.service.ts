import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { omit } from 'lodash';
import { compare } from 'bcrypt';
import { JwtConfig } from 'src/jwt.config';
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private dbService: PrismaService,
    private configService: ConfigService,
  ) {}

  // register
  async register(dto: any) {
    let user = await this.dbService.user.findFirst({
      where: {
        email: dto.email, //mencari berdasarkan email
      },
    });
    if (user) {
      //jika user sudah ada dengan email yang sama, maka bad request
      throw new HttpException('User Exists', HttpStatus.BAD_REQUEST);
    }
    //buat user baru, data masuk dari dto register
    let createUser = await this.dbService.user.create({
      data: dto,
    });
    // jika berhasil, kirim return
    if (createUser) {
      return {
        statusCode: 200,
        message: 'Register Success',
      };
    }
    // jika tidak berhasil, bad request
    throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
  }

  // login
  async login(dto: LoginDto) {
    // mencari dengan email
    let user = await this.dbService.user.findFirst({
      where: { email: dto.email },
    });
    // jika user tidak ada, beri not found
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    // cek password, compare dengan yang di input (dto) dan di database
    let checkPassword = await compare(dto.password, user.password);
    // jika password salah, Unauthorized
    if (!checkPassword) {
      throw new HttpException('Credential Incorrect', HttpStatus.UNAUTHORIZED);
    }
    // jika benar, buat token JWT yang mengambil dari id dan email
    return await this.generateJwt(
      user.id,
      user.email,
      user,
      JwtConfig.user_secret,
      JwtConfig.user_expired,
    );
  }

  // generate token JWT dari id dan email
  async generateJwt(
    id: string,
    email: string,
    user: any,
    user_secret: string,
    expired = JwtConfig.user_expired,
  ) {
    // membuat token dengan id, email, name, dan role
    const accessToken = await this.jwtService.sign(
      {
        sub: id,
        email,
        name: user.name,
        role: user.role,
      },
      {
        secret: JwtConfig.user_secret, // kunci dari jwt config yang mengarah ke env
        expiresIn: JwtConfig.user_expired, // durasi token dari jwt config yang mengarah ke env
      },
    );
    // token siap pakai di header
    return {
      statusCode: 200,
      accessToken: accessToken,
      user: omit(user, ['password', 'createdAt', 'updatedAt']),
    };
  }

  // token dikirim ketika logout
  async logout(token: string) {
    // jika token tidak dikirim, bad request
    if (!token) {
      throw new HttpException('Token not found', HttpStatus.BAD_REQUEST);
    }

    // rubah data ke bentuk asli(token)
    const decoded: any = this.jwtService.decode(token);
    // jika token sudah melebihi expired, maka invalid bad request
    if (!decoded?.exp) {
      throw new HttpException('Invalid Token', HttpStatus.BAD_REQUEST);
    }

    // blacklist token yang sudah logout ke database revokedToken agar tidak bisa terpakai
    await this.dbService.revokedToken.create({
      data: {
        token,
        expiredAt: new Date(decoded.exp * 1000),
      },
    });

    return {
      statusCode: 200,
      message: 'Logout Success',
    };
  }

  // ambil data user berdasarkan id untuk cek profile setiap user
  async getUserById(id: string) {
    const user = await this.dbService.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        telephone: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }

  // update user berdasarkan id dari dto update
  async updateUser(currentUser: any, id: string, dto: UpdateUserDto) {
    const userToUpdate = await this.dbService.user.findUnique({
      where: { id },
    });
    // jika tidak ada id, maka not found
    if (!userToUpdate)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    // role wajib admin
    if (currentUser.role !== 'admin') {
      throw new HttpException(
        'Forbidden: only admin can update users',
        HttpStatus.FORBIDDEN,
      );
    }

    // jika lolos, lakukan perubahan dari id, dan data dari dto
    const updatedUser = await this.dbService.user.update({
      where: { id },
      data: dto,
    });

    return {
      statusCode: 200,
      message: 'User updated successfully',
      user: updatedUser,
    };
  }
}
