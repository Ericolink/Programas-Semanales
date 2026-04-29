-- CreateTable Congregation
CREATE TABLE "Congregation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insertar congregación por defecto para datos existentes
INSERT INTO "Congregation" ("id", "name", "active") VALUES (1, 'Congregación Felipe Ángeles', true);

-- CreateTable User
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "congregationId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_congregationId_fkey" FOREIGN KEY ("congregationId") REFERENCES "Congregation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable Feedback
CREATE TABLE "Feedback" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_AssignmentType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "requiresHelper" BOOLEAN NOT NULL DEFAULT false,
    "congregationId" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "AssignmentType_congregationId_fkey" FOREIGN KEY ("congregationId") REFERENCES "Congregation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AssignmentType" ("gender", "id", "name", "order", "requiresHelper", "section", "congregationId")
SELECT "gender", "id", "name", "order", "requiresHelper", "section", 1 FROM "AssignmentType";
DROP TABLE "AssignmentType";
ALTER TABLE "new_AssignmentType" RENAME TO "AssignmentType";
CREATE UNIQUE INDEX "AssignmentType_name_congregationId_key" ON "AssignmentType"("name", "congregationId");

CREATE TABLE "new_Group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "congregationId" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "Group_congregationId_fkey" FOREIGN KEY ("congregationId") REFERENCES "Congregation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Group" ("id", "name", "congregationId")
SELECT "id", "name", 1 FROM "Group";
DROP TABLE "Group";
ALTER TABLE "new_Group" RENAME TO "Group";

CREATE TABLE "new_Member" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "groupId" INTEGER,
    "roleId" INTEGER,
    "congregationId" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Member_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Member_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Member_congregationId_fkey" FOREIGN KEY ("congregationId") REFERENCES "Congregation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Member" ("active", "createdAt", "gender", "groupId", "id", "name", "roleId", "congregationId")
SELECT "active", "createdAt", "gender", "groupId", "id", "name", "roleId", 1 FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";

CREATE TABLE "new_Week" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startDate" DATETIME NOT NULL,
    "congregationId" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "Week_congregationId_fkey" FOREIGN KEY ("congregationId") REFERENCES "Congregation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Week" ("id", "startDate", "congregationId")
SELECT "id", "startDate", 1 FROM "Week";
DROP TABLE "Week";
ALTER TABLE "new_Week" RENAME TO "Week";
CREATE UNIQUE INDEX "Week_startDate_congregationId_key" ON "Week"("startDate", "congregationId");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");