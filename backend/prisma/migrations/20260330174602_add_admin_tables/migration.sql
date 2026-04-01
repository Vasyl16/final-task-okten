-- CreateTable
CREATE TABLE "TopCategory" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_InstitutionToTopCategory" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_InstitutionToTopCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_InstitutionToTopCategory_B_index" ON "_InstitutionToTopCategory"("B");

-- AddForeignKey
ALTER TABLE "_InstitutionToTopCategory" ADD CONSTRAINT "_InstitutionToTopCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InstitutionToTopCategory" ADD CONSTRAINT "_InstitutionToTopCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "TopCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
