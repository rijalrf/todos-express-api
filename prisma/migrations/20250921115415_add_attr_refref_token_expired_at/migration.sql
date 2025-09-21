/*
  Warnings:

  - Added the required column `refreshTokenExpiredAt` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `refreshTokenExpiredAt` DATETIME(3) NOT NULL;
