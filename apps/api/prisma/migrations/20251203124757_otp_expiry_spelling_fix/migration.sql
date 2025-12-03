/*
  Warnings:

  - You are about to drop the column `otpExpirey` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "otpExpirey",
ADD COLUMN     "otpExpiry" TIMESTAMP(3);
