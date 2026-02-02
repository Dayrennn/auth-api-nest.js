import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtConfig } from 'src/jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  //membuat strategy jwt baru dari passport
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //ambil token dari header
      secretOrKey: JwtConfig.user_secret, //generate token
      passReqToCallback: true,
    });
  }

  //validate setelah token di verif, req dari client, payload dari JWT
  async validate(req: Request, payload: any) {
    const token = req.headers.authorization?.replace('Bearer ', '');

    //user tidak ada token, 401
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    //cek apakah token sudah di cabut
    const revoked = await this.prisma.revokedToken.findFirst({
      where: { token },
    });

    //jika token sudah di databae revokedToken, token tidak boleh di pakai lagi
    if (revoked) {
      throw new UnauthorizedException('Token revoked');
    }

    // setelah lolos, return data user
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  }
}
