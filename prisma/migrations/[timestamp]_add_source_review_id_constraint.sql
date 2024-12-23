-- CreateIndex
CREATE UNIQUE INDEX "Review_businessId_source_sourceReviewId_key" ON "Review"("businessId", "source", "sourceReviewId"); 