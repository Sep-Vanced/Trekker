-- CreateTable
CREATE TABLE "SosAlert" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "profile_id" INTEGER NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" DATETIME,
    CONSTRAINT "SosAlert_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
