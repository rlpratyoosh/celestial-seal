/*
  Warnings:

  - You are about to drop the column `otp` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "otp",
ADD COLUMN     "hashedOtp" TEXT,
ADD COLUMN     "otpCreatedAt" TIMESTAMP(3),
ADD COLUMN     "otpExpirey" TIMESTAMP(3);
