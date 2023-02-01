/*
  Warnings:

  - Made the column `desc` on table `Achievement` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Achievement" ALTER COLUMN "desc" SET NOT NULL;
