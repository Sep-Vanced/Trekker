export type IncidentStatus = "Pending" | "Responding" | "Resolved";
export type IncidentType = "SOS" | "Accident" | "Weather" | "Lost";

export interface Incident {
  id: number;
  touristId: number;
  type: IncidentType;
  message: string;
  location: {
    lat: number;
    lng: number;
  };
  barangay: string;
  reportedAt: Date; 
  status: IncidentStatus;
}