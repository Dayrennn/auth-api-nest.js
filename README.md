# 📦 Enday Food — Backend API

Backend REST API untuk aplikasi **Enday Food** menggunakan  
**NestJS + Prisma + PostgreSQL + JWT Authentication**

---

## 🧾 Table of Contents

1. 📦 Teknologi
2. 📋 Prasyarat
3. 🚀 Membuat Proyek NestJS
4. 📦 Instalasi Dependencies
5. 🔧 Konfigurasi Environment
6. 🗂 Setup Prisma & Database
7. 📜 Struktur Folder
8. 🧠 Prisma Service
9. 🔐 JWT Authentication
10. 🧪 Testing API
11. 📌 Catatan Penting

---

## 📦 1. Teknologi

- Node.js (18+)
- NestJS
- Prisma ORM
- PostgreSQL
- JWT
- Passport.js
- Bcrypt

---

## 📋 2. Prasyarat

Pastikan sudah terinstall:

- Node.js
- npm
- PostgreSQL

---

## 🚀 3. Membuat Proyek NestJS

```bash
npm i -g @nestjs/cli
nest new enday-food
cd enday-food
npm run start:dev
```

---

## 📦 4. Instalasi Dependencies

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install bcrypt
npm install @nestjs/config
npm install prisma @prisma/client
npm install -D @types/bcrypt
```

---

## 🔧 5. Konfigurasi Environment

Buat file `.env`

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/endayfood"
JWT_SECRET="supersecretkey"
JWT_EXPIRES_IN="1d"
```

---

## 🗂 6. Setup Prisma & Database

```bash
npx prisma init
```

```prisma
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
npx prisma generate
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
.prisma/
.env

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

## 🔐 9. JWT Authentication

JWT Strategy menggunakan `passport-jwt` dan `ConfigService`.

---

## 🧪 10. Testing API

### Register

POST `/auth/register`

### Login

POST `/auth/login`

---

## 📌 11. Catatan Penting

- Jangan commit `.env`
- Jalankan `prisma generate` jika schema berubah
