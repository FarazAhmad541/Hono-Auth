/*
  Warnings:

  - You are about to drop the column `sessionId` on the `UserSessions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[seesionToken]` on the table `UserSessions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `seesionToken` to the `UserSessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "UserSessions_sessionId_key";

-- AlterTable
ALTER TABLE "UserSessions" DROP COLUMN "sessionId",
ADD COLUMN     "seesionToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserSessions_seesionToken_key" ON "UserSessions"("seesionToken");
