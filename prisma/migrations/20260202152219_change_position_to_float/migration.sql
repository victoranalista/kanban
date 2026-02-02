/*
  Warnings:

  - You are about to alter the column `position` on the `KanbanCard` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "public"."KanbanCard" ALTER COLUMN "position" SET DATA TYPE DOUBLE PRECISION;
