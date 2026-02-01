import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { omit } from 'lodash';
import { compare } from 'bcrypt';
import { JwtConfig } from 'src/jwt.config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private dbService: PrismaService,
    private configService: ConfigService,
  ) {}

  async register(dto: any) {
    let user = await this.dbService.user.findFirst({
      where: {
        email: dto.email,
      },
    });
    if (user) {
      throw new HttpException('User Exists', HttpStatus.BAD_REQUEST);
    }
    let createUser = await this.dbService.user.create({
      data: dto,
    });
    if (createUser) {
      return {
        statusCode: 200,
        message: 'Register Success',
      };
    }
    throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
  }

  async login(dto: LoginDto) {
    let user = await this.dbService.user.findFirst({
      where: { email: dto.email },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    let checkPassword = await compare(dto.password, user.password);
    if (!checkPassword) {
      throw new HttpException('Credential Incorrect', HttpStatus.UNAUTHORIZED);
    }
    return await this.generateJwt(
      user.id,
      user.email,
      user,
      JwtConfig.user_secret,
      JwtConfig.user_expired,
    );
  }
  async generateJwt(
    id: string,
    email: string,
    user: any,
    user_secret: string,
    expired = JwtConfig.user_expired,
  ) {
    const accessToken = await this.jwtService.sign(
      {
        sub: id,
        email,
        name: user.name,
      },
      {
        secret: JwtConfig.user_secret,
        expiresIn: JwtConfig.user_expired,
      },
    );
    return {
      statusCode: 200,
      accessToken: accessToken,
      user: omit(user, ['password', 'createdAt', 'updatedAt']),
    };
  }

  async logout(token: string) {
    if (!token) {
      throw new HttpException('Token not found', HttpStatus.BAD_REQUEST);
    }

    const decoded: any = this.jwtService.decode(token);

    if (!decoded?.exp) {
      throw new HttpException('Invalid Token', HttpStatus.BAD_REQUEST);
    }

    await this.dbService.revokedToken.create({
      data: {
        token,
        expiredAt: new Date(decoded.exp * 1000),
      },
    });

    return {
      statusCode: 200,
      message: 'Logout Succes',
    };
  }
}
