import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ── Create users ──────────────────────────────────────────────────────────
  const trekkerPassword = await bcrypt.hash("trekker123", 10);
  const rangerPassword = await bcrypt.hash("ranger123", 10);

  const trekker = await prisma.user.upsert({
    where: { username: "juan_delacruz" },
    update: {},
    create: {
      username: "juan_delacruz",
      password: trekkerPassword,
      email: "juan@example.com",
      first_name: "Juan",
      last_name: "Dela Cruz",
      role: "trekker",
      phone: "09171234567",
      emergency_contact_name: "Maria Dela Cruz",
      emergency_contact_phone: "09987654321",
    },
  });

  const ranger = await prisma.user.upsert({
    where: { username: "ranger_marcos" },
    update: {},
    create: {
      username: "ranger_marcos",
      password: rangerPassword,
      email: "ranger@example.com",
      first_name: "Ranger",
      last_name: "Marcos",
      role: "ranger",
      phone: "09181234567",
    },
  });

  console.log(
    `✅ Users: ${trekker.username} (trekker), ${ranger.username} (ranger)`,
  );

  // ── Create campsites ──────────────────────────────────────────────────────
  const campsites = [
    {
      id: 1,
      name: "Camp Kuta",
      description:
        "The nearest and most accessible camp. Ideal for beginners and day-trippers.",
      latitude: "15.0401",
      longitude: "120.1154",
      phase: "Phase 1",
      is_active: true,
    },
    {
      id: 2,
      name: "Camp Rizal",
      description:
        "Mid-trail camp perched on a ridge with panoramic views of the lake.",
      latitude: "15.0523",
      longitude: "120.1203",
      phase: "Phase 2",
      is_active: true,
    },
    {
      id: 3,
      name: "Camp Silangan",
      description:
        "Remote camp on the eastern ridge. Rewards trekkers with sunrise views.",
      latitude: "15.0634",
      longitude: "120.1312",
      phase: "Phase 3",
      is_active: true,
    },
    {
      id: 4,
      name: "Camp Bundok",
      description:
        "Summit camp. The most challenging route. Only for experienced trekkers.",
      latitude: "15.0789",
      longitude: "120.1445",
      phase: "Phase 4",
      is_active: true,
    },
  ];

  for (const camp of campsites) {
    await prisma.campsite.upsert({
      where: { id: camp.id },
      update: {},
      create: camp,
    });
  }

  console.log("✅ Campsites created");

  // ── Create routes ─────────────────────────────────────────────────────────
  const routes = [
    {
      id: 1,
      name: "Camp Kuta Trail",
      description:
        "Easy trail through bamboo forest with a stream crossing. Perfect for beginners.",
      difficulty: "easy",
      difficulty_score: 1,
      status: "open" as const,
      start_name: "Mapanuepe Lake Trailhead",
      start_latitude: "15.0312",
      start_longitude: "120.1087",
      end_latitude: "15.0401",
      end_longitude: "120.1154",
      total_distance_km: "2.4",
      estimated_hours: "1",
      allowed_vehicles: "motorcycle,4x4,suv,foot",
      elevation_gain_m: 85,
      destination: 1,
      is_active: true,
    },
    {
      id: 2,
      name: "Camp Rizal Trail",
      description:
        "Moderate trek through dense forest with a rocky ridge section.",
      difficulty: "moderate",
      difficulty_score: 2,
      status: "open" as const,
      start_name: "Mapanuepe Lake Trailhead",
      start_latitude: "15.0312",
      start_longitude: "120.1087",
      end_latitude: "15.0523",
      end_longitude: "120.1203",
      total_distance_km: "4.8",
      estimated_hours: "2",
      allowed_vehicles: "motorcycle,4x4,foot",
      elevation_gain_m: 210,
      destination: 2,
      is_active: true,
    },
    {
      id: 3,
      name: "Camp Silangan Trail",
      description:
        "Hard trail with major river crossing and cliff edge sections.",
      difficulty: "hard",
      difficulty_score: 3,
      status: "caution" as const,
      start_name: "Mapanuepe Lake Trailhead",
      start_latitude: "15.0312",
      start_longitude: "120.1087",
      end_latitude: "15.0634",
      end_longitude: "120.1312",
      total_distance_km: "7.2",
      estimated_hours: "4",
      allowed_vehicles: "4x4,foot",
      elevation_gain_m: 380,
      destination: 3,
      is_active: true,
    },
    {
      id: 4,
      name: "Camp Bundok Summit Trail",
      description: "Expert summit trail. Requires guide and proper equipment.",
      difficulty: "expert",
      difficulty_score: 4,
      status: "closed" as const,
      start_name: "Mapanuepe Lake Trailhead",
      start_latitude: "15.0312",
      start_longitude: "120.1087",
      end_latitude: "15.0789",
      end_longitude: "120.1445",
      total_distance_km: "10.5",
      estimated_hours: "6",
      allowed_vehicles: "foot",
      elevation_gain_m: 620,
      destination: 4,
      is_active: true,
    },
  ];

  for (const route of routes) {
    await prisma.trekRoute.upsert({
      where: { id: route.id },
      update: {},
      create: route,
    });
  }

  console.log("✅ Routes created");

  // ── Create checkpoints ────────────────────────────────────────────────────
  const checkpoints: {
    id: number;
    route: number;
    name: string;
    order: number;
    latitude: string;
    longitude: string;
    cp_type: "waypoint" | "danger" | "rest" | "camp" | "emergency";
    description: string;
    alert_message?: string;
    radius_meters: number;
    is_mandatory: boolean;
  }[] = [
    {
      id: 1,
      route: 1,
      name: "Trailhead Gate",
      order: 1,
      latitude: "15.0312",
      longitude: "120.1087",
      cp_type: "waypoint",
      description: "Begin your trek here. Sign the logbook.",
      radius_meters: 50,
      is_mandatory: true,
    },
    {
      id: 2,
      route: 1,
      name: "Bamboo Forest",
      order: 2,
      latitude: "15.0345",
      longitude: "120.1110",
      cp_type: "waypoint",
      description: "Enter the bamboo grove. Stay on the marked path.",
      alert_message: "Entering bamboo forest. Watch for loose rocks underfoot.",
      radius_meters: 50,
      is_mandatory: false,
    },
    {
      id: 3,
      route: 1,
      name: "Stream Crossing #1",
      order: 3,
      latitude: "15.0372",
      longitude: "120.1132",
      cp_type: "danger",
      description: "Shallow stream — passable on foot. Check depth after rain.",
      alert_message: "River crossing ahead. Check water level before crossing.",
      radius_meters: 50,
      is_mandatory: true,
    },
    {
      id: 4,
      route: 1,
      name: "Camp Kuta Entrance",
      order: 4,
      latitude: "15.0401",
      longitude: "120.1154",
      cp_type: "camp",
      description: "You have arrived at Camp Kuta!",
      alert_message: "Welcome to Camp Kuta! You have reached your destination.",
      radius_meters: 100,
      is_mandatory: true,
    },
    {
      id: 5,
      route: 2,
      name: "Trailhead Gate",
      order: 1,
      latitude: "15.0312",
      longitude: "120.1087",
      cp_type: "waypoint",
      description: "Begin your trek here. Sign the logbook.",
      radius_meters: 50,
      is_mandatory: true,
    },
    {
      id: 6,
      route: 2,
      name: "Bamboo Forest",
      order: 2,
      latitude: "15.0345",
      longitude: "120.1110",
      cp_type: "waypoint",
      description: "Enter the bamboo grove.",
      radius_meters: 50,
      is_mandatory: false,
    },
    {
      id: 7,
      route: 2,
      name: "Stream Crossing #1",
      order: 3,
      latitude: "15.0372",
      longitude: "120.1132",
      cp_type: "danger",
      description: "Shallow stream crossing.",
      alert_message: "River crossing ahead. Check water level before crossing.",
      radius_meters: 50,
      is_mandatory: true,
    },
    {
      id: 8,
      route: 2,
      name: "Camp Kuta Junction",
      order: 4,
      latitude: "15.0401",
      longitude: "120.1154",
      cp_type: "waypoint",
      description: "Turn right for Camp Rizal trail.",
      alert_message: "Keep right at the junction for Camp Rizal trail.",
      radius_meters: 50,
      is_mandatory: false,
    },
    {
      id: 9,
      route: 2,
      name: "Rocky Ridge",
      order: 5,
      latitude: "15.0468",
      longitude: "120.1183",
      cp_type: "danger",
      description: "Steep rocky section. Use the rope guide provided.",
      alert_message: "Steep rocky section ahead. Use the guide rope. Go slow.",
      radius_meters: 50,
      is_mandatory: true,
    },
    {
      id: 10,
      route: 2,
      name: "Camp Rizal Entrance",
      order: 6,
      latitude: "15.0523",
      longitude: "120.1203",
      cp_type: "camp",
      description: "You have arrived at Camp Rizal!",
      alert_message: "Welcome to Camp Rizal! Enjoy the panoramic view.",
      radius_meters: 100,
      is_mandatory: true,
    },
    {
      id: 11,
      route: 3,
      name: "Trailhead Gate",
      order: 1,
      latitude: "15.0312",
      longitude: "120.1087",
      cp_type: "waypoint",
      description: "Begin your trek here.",
      radius_meters: 50,
      is_mandatory: true,
    },
    {
      id: 12,
      route: 3,
      name: "Major River Crossing",
      order: 2,
      latitude: "15.0430",
      longitude: "120.1160",
      cp_type: "danger",
      description: "Deep river. Motor crossing required during dry season.",
      alert_message:
        "Major river crossing. During rainy season, this may be impassable. Proceed with extreme caution.",
      radius_meters: 100,
      is_mandatory: true,
    },
    {
      id: 13,
      route: 3,
      name: "Cliff Trail",
      order: 3,
      latitude: "15.0550",
      longitude: "120.1255",
      cp_type: "danger",
      description: "Narrow trail along cliff edge. Single file only.",
      alert_message:
        "Cliff edge trail! Single file only. Do not look down. Hold the safety rope.",
      radius_meters: 50,
      is_mandatory: true,
    },
    {
      id: 14,
      route: 3,
      name: "Camp Silangan",
      order: 4,
      latitude: "15.0634",
      longitude: "120.1312",
      cp_type: "camp",
      description: "You have arrived!",
      alert_message:
        "Welcome to Camp Silangan! Sunrise views are best at 5:30 AM.",
      radius_meters: 100,
      is_mandatory: true,
    },
  ];

  for (const cp of checkpoints) {
    await prisma.checkpoint.upsert({
      where: { id: cp.id },
      update: {},
      create: cp,
    });
  }

  console.log("✅ Checkpoints created");

  // ── Create a sample registration ──────────────────────────────────────────
  const now = new Date();
  const entry = new Date(now);
  entry.setHours(entry.getHours() + 2);
  const exit = new Date(now);
  exit.setHours(exit.getHours() + 8);

  await prisma.tourismRegistration.upsert({
    where: { permit_number: "MT-SAMPLE-001" },
    update: {},
    create: {
      permit_number: "MT-SAMPLE-001",
      profile_id: trekker.id,
      route_id: 1,
      status: "registered",
      group_size: 2,
      planned_entry: entry,
      planned_exit: exit,
      notes: "Sample registration for testing",
    },
  });

  console.log("✅ Sample registration created");
  console.log("🌱 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
