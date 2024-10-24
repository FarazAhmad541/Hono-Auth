-- CreateTable
CREATE TABLE "UserSessions" (
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSessions_userId_key" ON "UserSessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSessions_sessionId_key" ON "UserSessions"("sessionId");

-- AddForeignKey
ALTER TABLE "UserSessions" ADD CONSTRAINT "UserSessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
