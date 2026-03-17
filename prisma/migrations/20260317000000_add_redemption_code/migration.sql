-- AlterTable: add redemptionCode column (nullable during migration, filled by app on next ticket creation)
ALTER TABLE "Ticket" ADD COLUMN "redemptionCode" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_redemptionCode_key" ON "Ticket"("redemptionCode");
