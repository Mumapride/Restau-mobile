-- DropForeignKey
ALTER TABLE `qrtoken` DROP FOREIGN KEY `QRToken_subscriptionId_fkey`;

-- DropIndex
DROP INDEX `QRToken_subscriptionId_fkey` ON `qrtoken`;

-- AlterTable
ALTER TABLE `qrtoken` MODIFY `subscriptionId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `QRToken` ADD CONSTRAINT `QRToken_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `Subscription`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
