import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class JwtAuthGuard extends AuthGuard('jwt') {
  // menentukan request apakah boleh di teruskan
  canActivate(context: ExecutionContext) {
    return super.canActivate(context); // menggunakan logika default authguard(jwt)
  }

  // menentukan token apakah valid atau tidak, jika ada eror atau user tidak ada, maka unauthorized
  handleRequest(err, user) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    // jika valid, masuk ke req.user untuk controller
    return user;
  }
}
