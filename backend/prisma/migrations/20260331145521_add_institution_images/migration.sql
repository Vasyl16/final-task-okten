-- AlterTable
ALTER TABLE "Institution" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" DROP DEFAULT;
