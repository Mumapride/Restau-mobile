/*
  Warnings:

  - You are about to drop the column `adminId` on the `announcement` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `announcement` DROP FOREIGN KEY `Announcement_adminId_fkey`;

-- DropIndex
DROP INDEX `Announcement_adminId_fkey` ON `announcement`;

-- AlterTable
ALTER TABLE `announcement` DROP COLUMN `adminId`;
