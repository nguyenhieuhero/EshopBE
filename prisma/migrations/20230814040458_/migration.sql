/*
  Warnings:

  - You are about to drop the `CategoryProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CategoryProduct" DROP CONSTRAINT "CategoryProduct_category_id_fkey";

-- DropForeignKey
ALTER TABLE "CategoryProduct" DROP CONSTRAINT "CategoryProduct_product_id_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "image_url" DROP DEFAULT;

-- DropTable
DROP TABLE "CategoryProduct";

-- CreateTable
CREATE TABLE "ProductCategory" (
    "product_id" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("product_id","category_id")
);

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
