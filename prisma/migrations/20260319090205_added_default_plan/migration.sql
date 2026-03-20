-- CreateTable
CREATE TABLE "DefaultPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sportPlanId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DefaultPlan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DefaultPlan" ADD CONSTRAINT "DefaultPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultPlan" ADD CONSTRAINT "DefaultPlan_sportPlanId_fkey" FOREIGN KEY ("sportPlanId") REFERENCES "SportPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
