import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { omit } from 'lodash';
import { compare } from 'bcrypt';
import { JwtConfig } from 'src/jwt.config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private dbService: PrismaService,
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
    secret: string,
    expired = JwtConfig.user_expired,
  ) {
    const accessToken = await this.jwtService.sign(
      {
        sub: id,
        email,
        name: user.name,
      },
      {
        expiresIn: expired,
        secret: secret,
      },
    );
    return {
      statusCode: 200,
      accessToken: accessToken,
      user: omit(user, ['password', 'createdAt', 'updatedAt']),
    };
  }
}
