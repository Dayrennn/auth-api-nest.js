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

- **Node.js** (LTS)
- **NestJS**
- **Prisma ORM**
- **JWT Authentication**
- **Bcrypt**
- **PostgreSQL**

---

## 📋 2. Prasyarat

Pastikan sudah terinstall:

- Node.js 18+
- npm
- PostgreSQL
- Git

---

## 🚀 3. Setup Proyek

```bash
git clone https://github.com/Dayrennn/enday-food.git
cd enday-food/backend
```

---

## 📦 4. Instalasi Dependencies

```bash
npm install
```

Tambahan:

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt @types/bcrypt
npm install @nestjs/config
```

---

## 🔧 5. Konfigurasi Database

File `.env`:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/endayfood"
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="1d"
```

---

## 🗂 6. Prisma Schema & Migrasi

```bash
npx prisma init
npx prisma migrate dev --name init
```

---

## 📜 7. Struktur Folder

```
src/
├─ auth/
├─ prisma/
├─ app.module.ts
```

---

## 🧠 8. Prisma Service

```ts
@Injectable()
export class PrismaService extends PrismaClient {
  async onModuleInit() {
    await this.$connect();
  }
}
```

---

## 🔐 9. JWT Strategy

```ts
secretOrKey: configService.getOrThrow<string>('JWT_SECRET');
```

---

## 🧪 10. Testing API

- POST `/auth/register`
- POST `/auth/login`

---

## 📌 11. Catatan

- Jangan commit file `.env`
- Gunakan Prisma generate setiap ubah schema

---

## 🎉 Selesai

Backend API siap digunakan 🚀
