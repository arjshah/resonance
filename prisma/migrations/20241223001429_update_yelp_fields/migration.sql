/*
  Warnings:

  - You are about to drop the `businesses` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[businessId,source,sourceReviewId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_businessId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Workflow" DROP CONSTRAINT "Workflow_businessId_fkey";

-- DropForeignKey
ALTER TABLE "businesses" DROP CONSTRAINT "businesses_ownerId_fkey";

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "lastSynced" TIMESTAMP(3);

-- DropTable
DROP TABLE "businesses";

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT,
    "industry" TEXT,
    "size" TEXT,
    "foundedYear" INTEGER,
    "yelpId" TEXT,
    "yelpUrl" TEXT,
    "yelpRating" DOUBLE PRECISION,
    "yelpReviewCount" INTEGER,
    "lastYelpSync" TIMESTAMP(3),
    "googlePlaceId" TEXT,
    "googleBusinessName" TEXT,
    "googleBusinessUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Business_yelpId_key" ON "Business"("yelpId");

-- CreateIndex
CREATE UNIQUE INDEX "Business_ownerId_key" ON "Business"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_businessId_source_sourceReviewId_key" ON "Review"("businessId", "source", "sourceReviewId");

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
