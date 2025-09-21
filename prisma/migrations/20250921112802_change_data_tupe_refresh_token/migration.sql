-- DropIndex
DROP INDEX `user_refreshToken_key` ON `user`;

-- AlterTable
ALTER TABLE `user` MODIFY `refreshToken` TEXT NULL;
