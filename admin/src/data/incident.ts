import type { Incident } from "@/types/incident";

export const INCIDENTS: Incident[] = [
  {
    id: 1,
    touristId: 101,
    type: "SOS",
    message: "Lost near trail",
    location: { lat: 14.9771, lng: 120.2813 },
    barangay: "Aglao",
    reportedAt: new Date(Date.now() - 1000 * 60 * 10),
    status: "Pending",
  },
  {
    id: 2,
    touristId: 102,
    type: "Accident",
    message: "Leg injury",
    location: { lat: 14.9772, lng: 120.1564 },
    barangay: "Burgos",
    reportedAt: new Date(Date.now() - 1000 * 60 * 25),
    status: "Responding",
  },
  {
    id: 3,
    touristId: 103,
    type: "Weather",
    message: "Flash flood alert",
    location: { lat: 14.9562, lng: 120.1731 },
    barangay: "Nagbunga",
    reportedAt: new Date(Date.now() - 1000 * 60 * 60),
    status: "Resolved",
  },
];