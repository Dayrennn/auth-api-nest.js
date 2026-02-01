# 🔐 auth-api-nest.js — Backend Authentication API

## 🛠 Overview

auth-api-nest.js adalah project backend **Authentication API** berbasis **NestJS + Prisma + PostgreSQL + JWT**.
Project ini dibuat sebagai media belajar backend authentication modern, dengan fokus pada:

- Register & Login
- JWT Authentication
- Protect Route
- Logout dengan token revocation
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
11. 🧪 Testing API
12. 📌 Catatan Tambahan

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
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model RevokedToken {
  id        String   @id @default(uuid())
  token     String   @unique
  revokedAt DateTime @default(now())
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
├── prisma/                       # ORM v5
│   └── schema.prisma
│
├── src/
│   ├── auth/                     # Authentication & Authorization
│   │   ├── dto/                  # Validasi data request
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   │
│   │   ├── auth.controller.ts    # Endpoint API untuk auth
│   │   ├── auth.service.ts       # Logic utama authentication
│   │   ├── auth.module.ts        # Mengatur Controller, Service, JWT & Passport
│   │   └── jwt.strategy.ts       # Passport JWT untuk ekstrak token & validasi payload
│   │
│   ├── prisma/
│   │   └── prisma.service.ts     # Koneksi database
│   │
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── app.module.ts             # Menggabungkan semua module
│   └── main.ts                   # Entry point
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
import { SignOptions } from 'jsonwebtoken';

export const JwtConfig = {
  user_secret: process.env.JWT_SECRET!,
  user_expired: '1d' as SignOptions['expiresIn'],
};
```

---

### 9.2 Auth Module

```ts
@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: JwtConfig.user_secret,
      signOptions: {
        expiresIn: JwtConfig.user_expired,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
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
    });
  }

  async validate(payload: any) {
    return payload;
  }
}
```

---

### 9.4 Login

```ts
const token = this.jwtService.sign({
  sub: user.id,
  email: user.email,
  name: user.name,
});
```

---

### 9.5 Protect Route

```ts
@UseGuards(AuthGuard('jwt'))
@Get('profile')
getProfile(@Req() req) {
  return req.user;
}
```

---

## 🚪 10. Logout (JWT Revocation)

Logout **tidak menghapus JWT**, tetapi **menandai token sebagai revoked** di database.

### 10.1 Logout Endpoint

```ts
@UseGuards(AuthGuard('jwt'))
@Post('logout')
async logout(@Req() req) {
  const token = req.headers.authorization.replace('Bearer ', '');
  return this.authService.logout(token);
}
```

---

### 10.2 Auth Service

```ts
async logout(token: string) {
  await this.prisma.revokedToken.create({
    data: { token },
  });

  return { message: 'Logout successful' };
}
```

---

### 10.3 Cek Token di JWT Strategy

```ts
const revoked = await this.prisma.revokedToken.findFirst({
  where: { token },
});

if (revoked) {
  throw new UnauthorizedException('Token revoked');
}
```

📌 **Hasil:**

- Token lama ❌ tidak bisa digunakan lagi
- User harus login ulang

---

## 🧪 11. Testing API

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
```

### Logout

```http
POST /auth/logout
Authorization: Bearer <token>
```

---

## 📌 12. Catatan Tambahan

- Jangan commit file `.env`
- Jalankan `prisma migrate dev` setiap schema berubah
- Logout JWT **membutuhkan database** (tidak stateless murni)
- Cocok sebagai base project untuk:
  - RBAC
  - Refresh Token
  - OAuth
  - Microservice Authentication
