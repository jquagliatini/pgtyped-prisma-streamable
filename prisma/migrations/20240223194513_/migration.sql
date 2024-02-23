-- CreateTable
CREATE TABLE "client" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_portal" (
    "clientId" UUID NOT NULL,
    "enabled" BOOLEAN NOT NULL,

    CONSTRAINT "client_portal_pkey" PRIMARY KEY ("clientId")
);

-- AddForeignKey
ALTER TABLE "client_portal" ADD CONSTRAINT "client_portal_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
