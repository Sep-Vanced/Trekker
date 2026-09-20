export type VehicleType = "Motorcycle" | "SUV" | "Sedan" | "4x4";

export interface VehicleRule {
  id: number;
  routeName: string;
  allowedVehicles: VehicleType[];
  warning: string;
}