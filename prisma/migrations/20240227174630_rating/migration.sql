-- CreateTable
CREATE TABLE "Rating" (
    "userId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "role" TEXT,
    "photo" TEXT NOT NULL,
    "course" TEXT,
    "group" TEXT,
    "totalReq" INTEGER NOT NULL,
    "get" INTEGER,
    "post" INTEGER,
    "put" INTEGER,
    "patch" INTEGER,
    "delete" INTEGER,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
