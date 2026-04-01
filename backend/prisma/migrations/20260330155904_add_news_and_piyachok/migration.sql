-- CreateEnum
CREATE TYPE "NewsCategory" AS ENUM ('GENERAL', 'PROMOTION', 'EVENT');

-- CreateTable
CREATE TABLE "News" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "category" "NewsCategory" NOT NULL,
    "institutionId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Piyachok" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "peopleCount" INTEGER NOT NULL,
    "genderPreference" TEXT,
    "budget" DOUBLE PRECISION,
    "whoPays" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Piyachok_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "News_institutionId_idx" ON "News"("institutionId");

-- CreateIndex
CREATE INDEX "News_category_idx" ON "News"("category");

-- CreateIndex
CREATE INDEX "Piyachok_institutionId_idx" ON "Piyachok"("institutionId");

-- CreateIndex
CREATE INDEX "Piyachok_userId_idx" ON "Piyachok"("userId");

-- AddForeignKey
ALTER TABLE "News" ADD CONSTRAINT "News_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Piyachok" ADD CONSTRAINT "Piyachok_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Piyachok" ADD CONSTRAINT "Piyachok_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
