/*
  Warnings:

  - A unique constraint covering the columns `[yelpBusinessId]` on the table `businesses` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "businesses_yelpBusinessId_key" ON "businesses"("yelpBusinessId");
