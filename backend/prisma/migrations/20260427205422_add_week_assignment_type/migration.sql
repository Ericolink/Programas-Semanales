-- CreateTable
CREATE TABLE "WeekAssignmentType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "weekId" INTEGER NOT NULL,
    "assignmentTypeId" INTEGER NOT NULL,
    "customName" TEXT,
    CONSTRAINT "WeekAssignmentType_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "Week" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WeekAssignmentType_assignmentTypeId_fkey" FOREIGN KEY ("assignmentTypeId") REFERENCES "AssignmentType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "WeekAssignmentType_weekId_assignmentTypeId_key" ON "WeekAssignmentType"("weekId", "assignmentTypeId");
