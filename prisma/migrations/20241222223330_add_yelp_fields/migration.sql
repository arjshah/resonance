-- DropIndex
DROP INDEX "Business_googlePlaceId_key";

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "yelpBusinessId" TEXT,
ADD COLUMN     "yelpBusinessName" TEXT,
ADD COLUMN     "yelpBusinessUrl" TEXT,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "country" DROP DEFAULT;
