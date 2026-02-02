import { SetMetadata } from '@nestjs/common'; // menyimpan metadata ke controller
import { Role } from './roles.enum';

export const ROLES_KEY = 'role'; // key untuk menyimpan metadata ke role
// Roles custom decorator yang digunakan ke controller dan endpoint
// ...role: Role[] bisa menuliskan satu atau lebih role yang di izinkan
export const Roles = (...role: Role[]) => SetMetadata(ROLES_KEY, role);
