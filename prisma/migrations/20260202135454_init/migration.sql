-- CreateEnum
CREATE TYPE "public"."ActivationStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'USER', 'API');

-- CreateEnum
CREATE TYPE "public"."SaleOrigin" AS ENUM ('INTERNATIONAL_LAW', 'FAMILY_LAW', 'BANKING_LAW', 'PROCEDURAL_LAW', 'ADMINISTRATIVE');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "taxpayerId" TEXT NOT NULL,
    "status" "public"."ActivationStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserHistory" (
    "id" SERIAL NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "password" TEXT,
    "totpSecret" TEXT,
    "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "totpVerifiedAt" TIMESTAMP(3),
    "status" "public"."ActivationStatus" NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KanbanBoard" (
    "id" TEXT NOT NULL,
    "saleOrigin" "public"."SaleOrigin" NOT NULL,
    "teamSize" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KanbanBoard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KanbanColumn" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "wipLimit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KanbanColumn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KanbanCard" (
    "id" TEXT NOT NULL,
    "columnId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specification" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "acceptanceCriteria" TEXT NOT NULL,
    "estimatedHours" INTEGER NOT NULL,
    "position" DECIMAL(65,30) NOT NULL,
    "isNext" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KanbanCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_taxpayerId_key" ON "public"."User"("taxpayerId");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "public"."User"("status");

-- CreateIndex
CREATE INDEX "UserHistory_version_idx" ON "public"."UserHistory"("version");

-- CreateIndex
CREATE INDEX "UserHistory_userId_idx" ON "public"."UserHistory"("userId");

-- CreateIndex
CREATE INDEX "UserHistory_email_status_idx" ON "public"."UserHistory"("email", "status");

-- CreateIndex
CREATE UNIQUE INDEX "UserHistory_userId_version_key" ON "public"."UserHistory"("userId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "KanbanBoard_saleOrigin_key" ON "public"."KanbanBoard"("saleOrigin");

-- CreateIndex
CREATE INDEX "KanbanBoard_saleOrigin_idx" ON "public"."KanbanBoard"("saleOrigin");

-- CreateIndex
CREATE INDEX "KanbanColumn_boardId_idx" ON "public"."KanbanColumn"("boardId");

-- CreateIndex
CREATE UNIQUE INDEX "KanbanColumn_boardId_order_key" ON "public"."KanbanColumn"("boardId", "order");

-- CreateIndex
CREATE INDEX "KanbanCard_columnId_idx" ON "public"."KanbanCard"("columnId");

-- CreateIndex
CREATE INDEX "KanbanCard_columnId_position_idx" ON "public"."KanbanCard"("columnId", "position");

-- CreateIndex
CREATE INDEX "KanbanCard_isNext_idx" ON "public"."KanbanCard"("isNext");

-- AddForeignKey
ALTER TABLE "public"."UserHistory" ADD CONSTRAINT "UserHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KanbanColumn" ADD CONSTRAINT "KanbanColumn_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "public"."KanbanBoard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KanbanCard" ADD CONSTRAINT "KanbanCard_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "public"."KanbanColumn"("id") ON DELETE CASCADE ON UPDATE CASCADE;
