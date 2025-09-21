/*
  Warnings:

  - You are about to drop the column `refreshTokenExpiredAt` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `refreshTokenExpiredAt`,
    ADD COLUMN `rtExpiredAt` DATETIME(3) NULL;
