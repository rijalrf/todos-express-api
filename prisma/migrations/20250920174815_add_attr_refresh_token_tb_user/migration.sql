/*
  Warnings:

  - Added the required column `refreshToken` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `refreshToken` VARCHAR(191) NOT NULL;
