# 🔐 auth-api-nest.js — Backend Authentication API

## 🛠 Overview

auth-api-nest.js adalah project backend **Authentication API** berbasis **NestJS + Prisma + PostgreSQL + JWT**.
Project ini dibuat sebagai media belajar backend authentication modern, dengan fokus pada:

- Register & Login
- JWT Authentication
- Protect Route
- Logout dengan token revocation
- Role-Based Access Control (RBAC)
- Struktur backend yang rapi & scalable

Dokumentasi ini merupakan tutorial **step-by-step dari nol sampai berjalan**, hasil gabungan referensi dan implementasi final.

---

## 🧾 Table of Contents

1. 📦 Teknologi
2. 📋 Prasyarat
3. 🚀 Setup Proyek
4. 📦 Instalasi Dependencies
5. 🔧 Konfigurasi Environment
6. 🗂 Prisma Schema & Migrasi
7. 📜 Struktur Folder
8. 🧠 Prisma Service
9. 🔐 JWT Authentication
10. 🚪 Logout (JWT Revocation)
11. 🔑 Role-Based Access Control
12. 🧪 Testing API
13. 📌 Catatan Tambahan

---

## 📦 1. Teknologi

- Node.js 18+
- NestJS
- Prisma ORM v5
- PostgreSQL
- JWT Authentication
- Passport JWT
- Bcrypt

---

## 📋 2. Prasyarat

- Node.js
- npm
- PostgreSQL
- Git

---

## 🚀 3. Setup Proyek

```bash
npx @nestjs/cli new auth-api-nest.js
cd auth-api-nest.js
```

---

## 📦 4. Instalasi Dependencies

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install @nestjs/config
npm install prisma @prisma/client
npm install -D @types/bcrypt @types/passport-jwt
```

---

## 🔧 5. Konfigurasi Environment

Buat file `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/auth_api"
JWT_SECRET=supersecretjwtkey
```

⚠️ **JWT_SECRET WAJIB ada di `.env`** agar:

- Aman (tidak hardcode)
- Bisa berbeda per environment (dev / prod)
- Bisa di-rotate tanpa mengubah source code

---

## 🗂 6. Prisma Schema & Migrasi

Inisialisasi Prisma:

```bash
npx prisma init
```

### `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  telephone String
  password  String
  role      Role     @default(user)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model RevokedToken {
  id        String   @id @default(uuid())
  token     String   @unique
  expiredAt DateTime
  createdAt DateTime @default(now())
}

enum Role {
  admin
  kepala_toko
  kasir
  user
}
```

Migrasi database:

```bash
npx prisma migrate dev --name init-auth
npx prisma generate
```

---

## 📜 7. Struktur Folder

```text
backend/
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── auth/
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   └── update-user.dto.ts  # DTO untuk update user termasuk role
│   │   │
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── jwt.strategy.ts
│   │   ├── transform-password.pipe.ts  # otomatis hash password
│   │   ├── role/
│   │   │   ├── roles.decorator.ts       # custom decorator @Roles()
│   │   │   ├── roles.enum.ts            # enum Role
│   │   │   └── roles.guard.ts           # RolesGuard untuk RBAC
│   │
│   ├── prisma/
│   │   └── prisma.service.ts
│   │
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── app.module.ts
│   └── main.ts
│
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🧠 8. Prisma Service

```ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

---

## 🔐 9. JWT Authentication

### 9.1 JWT Config

```ts
export const JwtConfig = {
  user_secret: process.env.JWT_SECRET!,
  user_expired: '1d',
};
```

---

### 9.2 Auth Module

```ts
@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    JwtModule.register({
      secret: JwtConfig.user_secret,
      signOptions: { expiresIn: JwtConfig.user_expired },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
```

---

### 9.3 JWT Strategy

```ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JwtConfig.user_secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('Token not found');

    const revoked = await this.prisma.revokedToken.findFirst({
      where: { token },
    });
    if (revoked) throw new UnauthorizedException('Token revoked');

    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  }
}
```

---

### 9.4 Login

```ts
const accessToken = await this.jwtService.sign({
  sub: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
});
```

---

### 9.5 Protect Route

```ts
@UseGuards(JwtAuthGuard)
@Get('profile')
async profile(@Req() req: any) {
  const id = req.user.sub;
  return await this.authService.getUserById(id);
}
```

---

## 🚪 10. Logout (JWT Revocation)

Logout **tidak menghapus JWT**, tetapi **menandai token sebagai revoked** di database.

```ts
@UseGuards(JwtAuthGuard)
@Post('logout')
async logout(@Req() req: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  return this.authService.logout(token);
}
```

```ts
async logout(token: string) {
  if (!token) throw new HttpException('Token not found', HttpStatus.BAD_REQUEST);

  const decoded: any = this.jwtService.decode(token);
  if (!decoded?.exp) throw new HttpException('Invalid Token', HttpStatus.BAD_REQUEST);

  await this.dbService.revokedToken.create({
    data: { token, expiredAt: new Date(decoded.exp * 1000) },
  });

  return { statusCode: 200, message: 'Logout Success' };
}
```

---

## 🔑 11. Role-Based Access Control (RBAC)

### 11.1 Role Enum

```ts
export enum Role {
  admin = 'admin',
  kepala_toko = 'kepala_toko',
  kasir = 'kasir',
  user = 'user',
}
```

### 11.2 Roles Decorator

```ts
export const ROLES_KEY = 'role';
export const Roles = (...role: Role[]) => SetMetadata(ROLES_KEY, role);
```

- Digunakan di controller untuk menentukan role yang boleh akses endpoint.
- Contoh:

```ts
@Roles(Role.ADMIN)
@Patch('update-user/:id')
```

### 11.3 Roles Guard

```ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true; // jika tidak ada role yang ditentukan, semua boleh akses

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return requiredRoles.includes(user.role);
  }
}
```

### 11.4 Update User Endpoint (Admin Only)

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(ValidationPipe)
@Patch('update-user/:id')
@Roles(Role.ADMIN)
async updateUser(
  @Req() req: any,
  @Param('id') id: string,
  @Body() dto: UpdateUserDto,
) {
  const currentUser = req.user;
  return await this.authService.updateUser(currentUser, id, dto);
}
```

- Hanya **admin** yang bisa mengubah data user lain.
- `currentUser` dari JWT, digunakan untuk membatasi update user **lain atau diri sendiri**.

---

## 🧪 12. Testing API

### Register

```http
POST /auth/register
```

### Login

```http
POST /auth/login
```

### Profile (Protected)

```http
GET /auth/profile
Authorization: Bearer <token>
```

### Logout

```http
POST /auth/logout
Authorization: Bearer <token>
```

### Update User (Admin Only)

```http
PATCH /auth/update-user/:id
Authorization: Bearer <token-admin>
Body: { "name": "New Name", "role": "user" }
```

---

## 📌 13. Catatan Tambahan

- Jangan commit file `.env`
- Jalankan `prisma migrate dev` setiap schema berubah
- Logout JWT **membutuhkan database** (tidak stateless murni)
- Cocok sebagai base project untuk:
  - RBAC
  - Refresh Token
  - OAuth
  - Microservice Authentication
