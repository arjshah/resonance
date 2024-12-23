-- DropForeignKey
ALTER TABLE "SyncLog" DROP CONSTRAINT "SyncLog_businessId_fkey";

-- AddForeignKey
ALTER TABLE "SyncLog" ADD CONSTRAINT "SyncLog_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
