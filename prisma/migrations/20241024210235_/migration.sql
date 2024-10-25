/*
  Warnings:

  - You are about to drop the column `seesionToken` on the `UserSessions` table. All the data in the column will be lost.
  - Added the required column `sessionToken` to the `UserSessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "UserSessions_seesionToken_key";

-- AlterTable
ALTER TABLE "UserSessions" DROP COLUMN "seesionToken",
ADD COLUMN     "sessionToken" TEXT NOT NULL;
