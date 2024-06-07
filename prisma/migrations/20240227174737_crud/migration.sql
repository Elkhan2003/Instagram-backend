-- CreateTable
CREATE TABLE "Crud" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "code" JSONB[],
    "isTrash" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL,

    CONSTRAINT "Crud_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Crud" ADD CONSTRAINT "Crud_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
