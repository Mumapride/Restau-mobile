-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('STUDENT', 'ADMIN', 'SCANNER') NOT NULL DEFAULT 'STUDENT';

-- CreateTable
CREATE TABLE `Scanner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `matricule` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `Scanner_matricule_key`(`matricule`),
    UNIQUE INDEX `Scanner_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Scanner` ADD CONSTRAINT `Scanner_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
