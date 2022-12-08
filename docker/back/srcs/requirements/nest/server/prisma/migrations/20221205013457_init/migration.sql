-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "tfa" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "winnerId" TEXT NOT NULL,
    "loserId" TEXT NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "img" TEXT,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PMChannel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Public Channel',
    "ownerId" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "password" TEXT,

    CONSTRAINT "PMChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PMMessage" (
    "id" SERIAL NOT NULL,
    "chanId" INTEGER NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "PMMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DMChannel" (
    "id" SERIAL NOT NULL,
    "userId1" TEXT NOT NULL,
    "userId2" TEXT NOT NULL,

    CONSTRAINT "DMChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DMMessage" (
    "id" SERIAL NOT NULL,
    "chanId" INTEGER NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "DMMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_friends" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_blocked" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AchievementToUser" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_chanAdmin" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_chanBlocked" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_friends_AB_unique" ON "_friends"("A", "B");

-- CreateIndex
CREATE INDEX "_friends_B_index" ON "_friends"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_blocked_AB_unique" ON "_blocked"("A", "B");

-- CreateIndex
CREATE INDEX "_blocked_B_index" ON "_blocked"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AchievementToUser_AB_unique" ON "_AchievementToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_AchievementToUser_B_index" ON "_AchievementToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_chanAdmin_AB_unique" ON "_chanAdmin"("A", "B");

-- CreateIndex
CREATE INDEX "_chanAdmin_B_index" ON "_chanAdmin"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_chanBlocked_AB_unique" ON "_chanBlocked"("A", "B");

-- CreateIndex
CREATE INDEX "_chanBlocked_B_index" ON "_chanBlocked"("B");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_loserId_fkey" FOREIGN KEY ("loserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PMChannel" ADD CONSTRAINT "PMChannel_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PMMessage" ADD CONSTRAINT "PMMessage_chanId_fkey" FOREIGN KEY ("chanId") REFERENCES "PMChannel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PMMessage" ADD CONSTRAINT "PMMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DMMessage" ADD CONSTRAINT "DMMessage_chanId_fkey" FOREIGN KEY ("chanId") REFERENCES "DMChannel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DMMessage" ADD CONSTRAINT "DMMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_friends" ADD CONSTRAINT "_friends_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_friends" ADD CONSTRAINT "_friends_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blocked" ADD CONSTRAINT "_blocked_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blocked" ADD CONSTRAINT "_blocked_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AchievementToUser" ADD CONSTRAINT "_AchievementToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AchievementToUser" ADD CONSTRAINT "_AchievementToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_chanAdmin" ADD CONSTRAINT "_chanAdmin_A_fkey" FOREIGN KEY ("A") REFERENCES "PMChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_chanAdmin" ADD CONSTRAINT "_chanAdmin_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_chanBlocked" ADD CONSTRAINT "_chanBlocked_A_fkey" FOREIGN KEY ("A") REFERENCES "PMChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_chanBlocked" ADD CONSTRAINT "_chanBlocked_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
