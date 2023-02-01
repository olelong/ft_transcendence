/*
  Warnings:

  - You are about to drop the `_chanBlocked` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `img` on table `Achievement` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `time` to the `DMMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loserScore` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `winnerScore` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `img` to the `PMChannel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `PMMessage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_chanBlocked" DROP CONSTRAINT "_chanBlocked_A_fkey";

-- DropForeignKey
ALTER TABLE "_chanBlocked" DROP CONSTRAINT "_chanBlocked_B_fkey";

-- AlterTable
ALTER TABLE "Achievement" ALTER COLUMN "img" SET NOT NULL;

-- AlterTable
ALTER TABLE "DMMessage" ADD COLUMN     "time" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "loserScore" INTEGER NOT NULL,
ADD COLUMN     "winnerScore" INTEGER NOT NULL,
ALTER COLUMN "time" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PMChannel" ADD COLUMN     "img" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PMMessage" ADD COLUMN     "time" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "_chanBlocked";

-- CreateTable
CREATE TABLE "MutedUser" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "time" TIMESTAMP(3),

    CONSTRAINT "MutedUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockedUser" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "time" TIMESTAMP(3),

    CONSTRAINT "BlockedUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MutedUserToPMChannel" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_BlockedUserToPMChannel" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_MutedUserToPMChannel_AB_unique" ON "_MutedUserToPMChannel"("A", "B");

-- CreateIndex
CREATE INDEX "_MutedUserToPMChannel_B_index" ON "_MutedUserToPMChannel"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BlockedUserToPMChannel_AB_unique" ON "_BlockedUserToPMChannel"("A", "B");

-- CreateIndex
CREATE INDEX "_BlockedUserToPMChannel_B_index" ON "_BlockedUserToPMChannel"("B");

-- AddForeignKey
ALTER TABLE "MutedUser" ADD CONSTRAINT "MutedUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedUser" ADD CONSTRAINT "BlockedUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MutedUserToPMChannel" ADD CONSTRAINT "_MutedUserToPMChannel_A_fkey" FOREIGN KEY ("A") REFERENCES "MutedUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MutedUserToPMChannel" ADD CONSTRAINT "_MutedUserToPMChannel_B_fkey" FOREIGN KEY ("B") REFERENCES "PMChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlockedUserToPMChannel" ADD CONSTRAINT "_BlockedUserToPMChannel_A_fkey" FOREIGN KEY ("A") REFERENCES "BlockedUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlockedUserToPMChannel" ADD CONSTRAINT "_BlockedUserToPMChannel_B_fkey" FOREIGN KEY ("B") REFERENCES "PMChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
