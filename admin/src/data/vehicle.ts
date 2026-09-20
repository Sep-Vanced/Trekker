import type { Weather } from "@/types/weather";

export const weatherData: Weather[] = [
  {
    id: 1,
    routeName: "Camp Kuta Trail",
    temperature: 26,
    rainfall: 15,
    windSpeed: 20,
    condition: "Heavy Rain",
    level: "Danger",
  },
  {
    id: 2,
    routeName: "Camp Ridge Trail",
    temperature: 28,
    rainfall: 2,
    windSpeed: 10,
    condition: "Cloudy",
    level: "Safe",
  },
  {
    id: 3,
    routeName: "Camp Sierra Trail",
    temperature: 25,
    rainfall: 8,
    windSpeed: 15,
    condition: "Light Rain",
    level: "Warning",
  },
  {
    id: 4,
    routeName: "Camp Verde Trail",
    temperature: 30,
    rainfall: 0,
    windSpeed: 5,
    condition: "Sunny",
    level: "Safe",
  },
];