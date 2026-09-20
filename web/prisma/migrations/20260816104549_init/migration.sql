-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'trekker',
    "phone" TEXT,
    "emergency_contact_name" TEXT,
    "emergency_contact_phone" TEXT,
    "offline_maps_downloaded" BOOLEAN NOT NULL DEFAULT false,
    "last_known_latitude" REAL,
    "last_known_longitude" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Campsite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "latitude" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TrekRoute" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" TEXT NOT NULL,
    "difficulty_score" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'open',
    "start_name" TEXT NOT NULL,
    "start_latitude" TEXT NOT NULL,
    "start_longitude" TEXT NOT NULL,
    "end_latitude" TEXT NOT NULL,
    "end_longitude" TEXT NOT NULL,
    "total_distance_km" TEXT NOT NULL,
    "estimated_hours" TEXT NOT NULL,
    "allowed_vehicles" TEXT,
    "elevation_gain_m" INTEGER NOT NULL DEFAULT 0,
    "offline_map_file" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "destination" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "TrekRoute_destination_fkey" FOREIGN KEY ("destination") REFERENCES "Campsite" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Checkpoint" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "latitude" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "cp_type" TEXT NOT NULL DEFAULT 'waypoint',
    "description" TEXT,
    "alert_message" TEXT,
    "radius_meters" INTEGER NOT NULL DEFAULT 50,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT false,
    "route" INTEGER NOT NULL,
    CONSTRAINT "Checkpoint_route_fkey" FOREIGN KEY ("route") REFERENCES "TrekRoute" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TourismRegistration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "permit_number" TEXT NOT NULL,
    "qr_code" TEXT,
    "profile_id" INTEGER NOT NULL,
    "route_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'registered',
    "group_size" INTEGER NOT NULL DEFAULT 1,
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

-- CreateTable
CREATE TABLE "TrekkingSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" DATETIME,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "profile" INTEGER NOT NULL,
    "route" INTEGER NOT NULL,
    CONSTRAINT "TrekkingSession_profile_fkey" FOREIGN KEY ("profile") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrekkingSession_route_fkey" FOREIGN KEY ("route") REFERENCES "TrekRoute" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LocationLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "latitude" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "recorded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "session" INTEGER NOT NULL,
    CONSTRAINT "LocationLog_session_fkey" FOREIGN KEY ("session") REFERENCES "TrekkingSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeatherReport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "route" INTEGER NOT NULL,
    "condition" TEXT NOT NULL,
    "condition_display" TEXT NOT NULL,
    "temperature_c" TEXT NOT NULL,
    "wind_speed_kph" TEXT NOT NULL,
    "rainfall_mm" TEXT NOT NULL,
    "humidity_pct" INTEGER NOT NULL,
    "is_safe_to_trek" BOOLEAN NOT NULL DEFAULT true,
    "recorded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WeatherReport_route_fkey" FOREIGN KEY ("route") REFERENCES "TrekRoute" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TourismRegistration_permit_number_key" ON "TourismRegistration"("permit_number");
