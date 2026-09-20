-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TourismRegistration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "permit_number" TEXT NOT NULL,
    "qr_code" TEXT,
    "profile_id" INTEGER NOT NULL,
    "route_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'registered',
    "group_size" INTEGER NOT NULL DEFAULT 1,
    "age" INTEGER,
    "citizen" TEXT,
    "place" TEXT,
    "pax" INTEGER NOT NULL DEFAULT 1,
    "planned_entry" DATETIME NOT NULL,
    "planned_exit" DATETIME NOT NULL,
    "actual_entry" DATETIME,
    "actual_exit" DATETIME,
    "is_overdue" BOOLEAN NOT NULL DEFAULT false,
    "trek_duration" TEXT,
    "notes" TEXT,
    "registered_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "TourismRegistration_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TourismRegistration_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "TrekRoute" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TourismRegistration" ("actual_entry", "actual_exit", "group_size", "id", "is_overdue", "notes", "permit_number", "planned_entry", "planned_exit", "profile_id", "qr_code", "registered_at", "route_id", "status", "trek_duration", "updated_at") SELECT "actual_entry", "actual_exit", "group_size", "id", "is_overdue", "notes", "permit_number", "planned_entry", "planned_exit", "profile_id", "qr_code", "registered_at", "route_id", "status", "trek_duration", "updated_at" FROM "TourismRegistration";
DROP TABLE "TourismRegistration";
ALTER TABLE "new_TourismRegistration" RENAME TO "TourismRegistration";
CREATE UNIQUE INDEX "TourismRegistration_permit_number_key" ON "TourismRegistration"("permit_number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
