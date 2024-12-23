-- CreateTable
CREATE TABLE "SyncLog" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "reviewsSynced" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER NOT NULL,
    "error" TEXT,

    CONSTRAINT "SyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SyncLog_businessId_source_idx" ON "SyncLog"("businessId", "source");

-- AddForeignKey
ALTER TABLE "SyncLog" ADD CONSTRAINT "SyncLog_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
