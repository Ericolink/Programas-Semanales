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
    "congregationId" INTEGER NOT NULL,
    CONSTRAINT "AssignmentType_congregationId_fkey" FOREIGN KEY ("congregationId") REFERENCES "Congregation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AssignmentType" ("congregationId", "gender", "id", "name", "order", "requiresHelper", "section") SELECT "congregationId", "gender", "id", "name", "order", "requiresHelper", "section" FROM "AssignmentType";
DROP TABLE "AssignmentType";
ALTER TABLE "new_AssignmentType" RENAME TO "AssignmentType";
CREATE UNIQUE INDEX "AssignmentType_name_congregationId_key" ON "AssignmentType"("name", "congregationId");
CREATE TABLE "new_Group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "congregationId" INTEGER NOT NULL,
    CONSTRAINT "Group_congregationId_fkey" FOREIGN KEY ("congregationId") REFERENCES "Congregation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Group" ("congregationId", "id", "name") SELECT "congregationId", "id", "name" FROM "Group";
DROP TABLE "Group";
ALTER TABLE "new_Group" RENAME TO "Group";
CREATE TABLE "new_Member" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "groupId" INTEGER,
    "roleId" INTEGER,
    "congregationId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Member_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Member_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Member_congregationId_fkey" FOREIGN KEY ("congregationId") REFERENCES "Congregation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Member" ("active", "congregationId", "createdAt", "gender", "groupId", "id", "name", "roleId") SELECT "active", "congregationId", "createdAt", "gender", "groupId", "id", "name", "roleId" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
CREATE TABLE "new_Week" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startDate" DATETIME NOT NULL,
    "congregationId" INTEGER NOT NULL,
    CONSTRAINT "Week_congregationId_fkey" FOREIGN KEY ("congregationId") REFERENCES "Congregation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Week" ("congregationId", "id", "startDate") SELECT "congregationId", "id", "startDate" FROM "Week";
DROP TABLE "Week";
ALTER TABLE "new_Week" RENAME TO "Week";
CREATE UNIQUE INDEX "Week_startDate_congregationId_key" ON "Week"("startDate", "congregationId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
