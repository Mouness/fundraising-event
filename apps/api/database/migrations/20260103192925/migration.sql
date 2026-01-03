/*
  Warnings:

  - You are about to drop the column `stripePaymentIntentId` on the `Donation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[transactionId]` on the table `Donation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Donation_stripePaymentIntentId_key";

-- AlterTable
ALTER TABLE "Donation" DROP COLUMN "stripePaymentIntentId",
ADD COLUMN     "transactionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Donation_transactionId_key" ON "Donation"("transactionId");
