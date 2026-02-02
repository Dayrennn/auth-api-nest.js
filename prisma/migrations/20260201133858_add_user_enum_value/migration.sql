-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'kepala_toko', 'kasir', 'user');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'user';
