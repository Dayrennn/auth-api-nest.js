import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtConfig } from 'src/jwt.config';

// mengumpulkan controller, service, dan provider
@Module({
  imports: [
    // menggunakan passport modul untuk autentikasi
    PassportModule.register({
      defaultStrategy: 'jwt', // default menggunakan jwt
      property: 'user', // jwt di tempatkan pada req.user
      session: false, // tidak menggunakan session karna stateless
    }),
    // mengatur jwt module untuk membuat dan verif token
    JwtModule.register({
      secret: JwtConfig.user_secret, // kunci rahasia token dari jwt config
      signOptions: {
        expiresIn: JwtConfig.user_expired, // durasi token sebelum kadarluarsa
      },
    }),
  ],
  // semua providers disini bisa di inject ke controller atau service lain
  providers: [AuthService, JwtStrategy],
  // endpoint yang bisa di akses client
  controllers: [AuthController],
})
export class AuthModule {}
