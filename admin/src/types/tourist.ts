export type TouristStatus = "Active" | "Completed" | "Emergency";

export interface Tourist {
  id: number;
  name: string;
  contact: string;
  vehicle: "Motorcycle" | "SUV" | "Sedan" | "4x4";
  status: TouristStatus;
  destination: string;
  startTime: string;
  location: {
    lat: number;
    lng: number;
  };
  lastPing: string;
}