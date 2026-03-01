-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('Pending', 'Signed', 'Rejected');

-- CreateTable
CREATE TABLE "Agreement" (
    "id" SERIAL NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "managerCognitoId" TEXT NOT NULL,
    "tenantCognitoId" TEXT NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "customTerms" TEXT,
    "status" "AgreementStatus" NOT NULL DEFAULT 'Pending',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signedAt" TIMESTAMP(3),

    CONSTRAINT "Agreement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agreement_applicationId_key" ON "Agreement"("applicationId");

-- AddForeignKey
ALTER TABLE "Agreement" ADD CONSTRAINT "Agreement_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
