# 📦 Enday Food — Backend API

## 🛠 Overview

Enday Food adalah aplikasi pemesanan makanan yang masih tahap pembelajaran, saat ini masih tahap backend Authentication. Backend REST API ini berbasis **NestJS + Prisma + PostgreSQL + JWT Authentication**.
Dokumentasi ini merupakan tutorial lengkap dari nol hingga aplikasi berjalan, menggabungkan referensi dari Agik Setiawan dan hasil implementasi final pada project ini.

---

## 🧾 Table of Contents

1. 📦 Teknologi
2. 📋 Prasyarat
3. 🚀 Setup Proyek
4. 📦 Instalasi Dependencies
5. 🔧 Konfigurasi Database
6. 🗂 Prisma Schema & Migrasi
7. 📜 Struktur Folder
8. 🧠 Prisma Service
9. 🔐 JWT Authentication
10. 🧪 Testing API
11. 📌 Catatan Tambahan

---

## 📦 1. Teknologi

- Node.js
- NestJS
- Prisma ORM v5
- PostgreSQL
- JWT Authentication
- Bcrypt

---

## 📋 2. Prasyarat

- Node.js 18+
- npm
- PostgreSQL
- Git

---

## 🚀 3. Setup Proyek

Buat project NestJS:

```bash
npx @nestjs/cli new backend
cd backend
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

## 🔧 5. Konfigurasi Database

Buat database PostgreSQL lalu isi file `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/endayfood"
JWT_SECRET=supersecretjwtkey
JWT_EXPIRES_IN=1d
```

---

## 🗂 6. Prisma Schema & Migrasi

```bash
npx prisma init
```

`prisma/schema.prisma`

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
```

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 📜 7. Struktur Folder

```text
src/
├─ auth/
│  ├─ auth.controller.ts
│  ├─ auth.service.ts
│  ├─ jwt.strategy.ts
│  └─ dto/
│     ├─ login.dto.ts
│     └─ register.dto.ts
├─ prisma/
│  ├─ prisma.module.ts
│  └─ prisma.service.ts
├─ app.module.ts
.env
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

### 9.1 Konfigurasi JWT

`src/jwt.config.ts`

```ts
export const JwtConfig = {
  user_secret: process.env.JWT_SECRET as string,
  user_expired: process.env.JWT_EXPIRES_IN || '1d',
};
```

---

### 9.2 Auth Module

```ts
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
    JwtModule.register({
      secret: JwtConfig.user_secret,
      signOptions: { expiresIn: JwtConfig.user_expired },
    }),
    PrismaModule,
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
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return payload;
  }
}
```

---

### 9.4 Auth Service (Login)

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

## 🧪 10. Testing API

### Register

`POST /auth/register`

### Login

`POST /auth/login`

---

## 📌 11. Catatan Tambahan

- Jalankan `prisma generate` setiap schema berubah
- Jangan commit file `.env`
- JWT Guard bisa dipasang di controller manapun
