import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from './roles.enum';

@Injectable()
// memeriksa role user sebelum ke endpoint
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {} // membada metadata dari decorator @Role() di controller

  // dijalankan setiap ada request ke endpoint
  canActivate(context: ExecutionContext): boolean {
    // mengambil role yang di izin kan oleh decorator
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // jika tidak ada role yang di tentukan, semua boleh akses
    if (!requiredRoles) {
      return true;
    }
    // ambil data request
    const request = context.switchToHttp().getRequest();
    // berisi data user yang login
    const user = request.user;
    // cek apakah role di izinkan, kalo ga ada akan forbidden
    return requiredRoles.includes(user.role);
  }
}
