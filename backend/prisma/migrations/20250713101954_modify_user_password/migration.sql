/*
  Warnings:

  - Added the required column `password` to the `User_d` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User_d" ADD COLUMN     "password" TEXT NOT NULL;
