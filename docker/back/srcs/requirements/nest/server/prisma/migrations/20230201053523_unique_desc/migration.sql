/*
  Warnings:

  - A unique constraint covering the columns `[desc]` on the table `Achievement` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Achievement_desc_key" ON "Achievement"("desc");
