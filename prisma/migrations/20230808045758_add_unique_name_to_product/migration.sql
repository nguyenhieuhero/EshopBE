/*
  Warnings:

  - You are about to drop the column `desc` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `desc` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `discount_id` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `Discount` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Made the column `image_url` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_discount_id_fkey";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "desc",
ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "desc",
DROP COLUMN "discount_id",
ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "image_url" SET NOT NULL,
ALTER COLUMN "image_url" SET DEFAULT 'user_img_url';

-- DropTable
DROP TABLE "Discount";

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");
