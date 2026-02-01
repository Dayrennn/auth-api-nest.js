# 📦 Enday Food — Backend API

## 🛠 Overview

Enday Food adalah aplikasi backend REST API berbasis **NestJS + Prisma + PostgreSQL + JWT Authentication**.  
Dokumentasi ini menjelaskan langkah lengkap setup proyek dari awal sampai jalan, mengikuti gaya tutorial Agik Setiawan dan hasil koding final yang sudah diperbaiki.

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

Proyek ini menggunakan:

- Node.js (LTS)
- NestJS — Framework backend
- Prisma — ORM untuk PostgreSQL
- JWT (JSON Web Token)
- Bcrypt — hashing password
- PostgreSQL — database

---

## 📋 2. Prasyarat

Pastikan sudah terinstall:

- Node.js 18+
- npm
- PostgreSQL
- Git

---

## 🚀 3. Setup Proyek

### Clone Repository

```bash
git clone https://github.com/Dayrennn/enday-food.git
cd enday-food/backend
```

---

## 📦 4. Instalasi Dependencies

```bash
npm install
```

Install dependency tambahan:

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt @types/bcrypt
npm install @nestjs/config
```

---

## 🔧 5. Konfigurasi Database

Buat database PostgreSQL, lalu isi file `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/endayfood"
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="1d"
```

---

## 🗂 6. Prisma Schema & Migrasi

### Inisialisasi Prisma

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
```

Generate Prisma Client:

```bash
npx prisma generate
```

Migrasi database:

```bash
npx prisma migrate dev --name init
```

---

## 📜 7. Struktur Folder

```
src/
├─ auth/
│  ├─ auth.controller.ts
│  ├─ auth.service.ts
│  ├─ jwt.strategy.ts
│  ├─ dto/
│  │  ├─ login.dto.ts
│  │  └─ register.dto.ts
├─ prisma/
│  └─ prisma.service.ts
├─ app.module.ts
.env
```

---

## 🧠 8. Prisma Service

```ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

---

## 🔐 9. JWT Authentication

### JwtStrategy

```ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return payload;
  }
}
```

### AuthService (Register & Login)

```ts
async register(dto: RegisterDto) {
  const user = await this.dbService.user.findFirst({
    where: { email: dto.email },
  });

  if (user) {
    throw new HttpException('User Exists', HttpStatus.BAD_REQUEST);
  }

  const hashedPassword = await bcrypt.hash(dto.password, 12);

  await this.dbService.user.create({
    data: {
      name: dto.name,
      email: dto.email,
      telephone: dto.telephone,
      password: hashedPassword,
    },
  });

  return {
    statusCode: 201,
    message: 'Register Success',
  };
}

async login(dto: LoginDto) {
  const user = await this.dbService.user.findFirst({
    where: { email: dto.email },
  });

  if (!user) {
    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }

  const valid = await bcrypt.compare(dto.password, user.password);

  if (!valid) {
    throw new HttpException(
      'Credential Incorrect',
      HttpStatus.UNAUTHORIZED,
    );
  }

  const token = this.jwtService.sign({
    sub: user.id,
    email: user.email,
    name: user.name,
  });

  return {
    statusCode: 200,
    accessToken: token,
  };
}
```

---

## 🧪 10. Testing API

### Register

```
POST /auth/register
```

```json
{
  "name": "Rafly",
  "email": "rafly@gmail.com",
  "telephone": "08123456789",
  "password": "password"
}
```

### Login

```
POST /auth/login
```

```json
{
  "email": "rafly@gmail.com",
  "password": "password"
}
```

---

## 📌 11. Catatan Tambahan

- Jalankan `npx prisma generate` setiap kali schema berubah
- Jangan commit file `.env`
- Gunakan AuthGuard JWT untuk proteksi endpoint
