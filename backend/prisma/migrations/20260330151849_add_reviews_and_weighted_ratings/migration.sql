/*
  Warnings:

  - You are about to alter the column `lat` on the `Institution` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,8)` to `DoublePrecision`.
  - You are about to alter the column `lng` on the `Institution` table. The data in that column could be lost. The data in that column will be cast from `Decimal(11,8)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "Institution" ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "reviewsCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "lat" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "lng" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Review" (
    "id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT,
    "averageCheck" DOUBLE PRECISION,
    "userId" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_institutionId_idx" ON "Review"("institutionId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_institutionId_key" ON "Review"("userId", "institutionId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
