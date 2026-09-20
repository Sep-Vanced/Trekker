export type TerrainType = "Safe" | "Warning" | "Danger";

export const TERRAIN_DATA = [
    {
        id: "mapanuepe_road",
        name: "Mapanuepe Road",
        status: "Dry & Compact",
        description: "Optimal conditions for standard trekking vehicles.",
        type: "Safe" as TerrainType,
    },
    {
        id: "lahar_routes",
        name: "Lahar Routes",
        status: "Soft & Muddy",
        description: "High risk of wheel burial. 4x4 engagement required.",
        type: "Warning" as TerrainType,
    },
    {
        id: "river_crossings",
        name: "River Crossings",
        status: "Elevated Flow",
        description: "Current: 0.8m. Restricted for non-specialized vehicles.",
        type: "Danger" as TerrainType,
    }
];

export const VEHICLE_MATRIX = [
    { id: 1, type: "4x4 Specialized", status: "Allowed", logic: "Engage Low-Range", color: "#0C8345" },
    { id: 2, type: "Motorcycles", status: "Allowed", logic: "Dry Season Only", color: "#F5BB00" },
    { id: 3, type: "Standard Sedans", status: "Restricted", logic: "Rainy Season Protocol", color: "#FF6B35" },
];