import { NextResponse } from "next/server";

const VEHICLES = [
  {
    id: "motorcycle",
    name: "Motorcycle / Habal-habal",
    icon: "🏍️",
    suitable: ["camp_kuta", "camp_rizal"],
    restrictions: [
      "Not recommended during heavy rain",
      "Cannot reach Camp Silangan and Camp Bundok",
      "Requires experienced trail rider",
    ],
  },
  {
    id: "4x4",
    name: "4x4 Vehicle",
    icon: "🚙",
    suitable: ["camp_kuta", "camp_rizal", "camp_silangan"],
    restrictions: [
      "Cannot pass narrow cliff trail to Camp Bundok",
      "River crossing depth limit: 70cm",
    ],
  },
  {
    id: "suv",
    name: "SUV",
    icon: "🚗",
    suitable: ["camp_kuta"],
    restrictions: [
      "Only suitable for Camp Kuta route",
      "Avoid during rainy season",
      "Not recommended for river crossings",
    ],
  },
  {
    id: "sedan",
    name: "Sedan",
    icon: "🚘",
    suitable: [],
    restrictions: [
      "❌ NOT recommended for any route",
      "Insufficient ground clearance",
      "Park at trailhead and proceed on foot",
    ],
  },
  {
    id: "foot",
    name: "On Foot / Hiking",
    icon: "🥾",
    suitable: ["camp_kuta", "camp_rizal", "camp_silangan", "camp_bundok"],
    restrictions: [
      "All routes accessible on foot",
      "Proper footwear required for Camp Bundok",
    ],
  },
];

export async function GET() {
  return NextResponse.json(VEHICLES);
}
