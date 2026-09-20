import type { Weather } from "@/types/weather";
import type { WeatherMetrics } from "@/types/weather";
import { getWeatherLevel } from "@/utils/waether";

export const computeWeatherMetrics = (
  data: Weather[]
): WeatherMetrics => {
  const totalTemp = data.reduce((sum, d) => sum + d.temperature, 0);
  const totalRain = data.reduce((sum, d) => sum + d.rainfall, 0);
  const totalWind = data.reduce((sum, d) => sum + d.windSpeed, 0);
  const maxRiver = Math.max(...data.map(d => d.riverLevel));

  const avgTemperature = totalTemp / data.length;
  const avgWindSpeed = totalWind / data.length;

  // determine highest risk
  const riskPriority = { Safe: 0, Warning: 1, Danger: 2 };

  let overallRisk: "Safe" | "Warning" | "Danger" = "Safe";

  data.forEach((d) => {
    const level = getWeatherLevel(d);
    if (riskPriority[level] > riskPriority[overallRisk]) {
      overallRisk = level;
    }
  });

  return {
    avgTemperature,
    totalRainfall: totalRain,
    avgWindSpeed,
    maxRiverLevel: maxRiver,
    overallRisk,
  };
};