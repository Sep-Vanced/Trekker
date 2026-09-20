export type LayerState = {
  trekkers: boolean;
  hazards: boolean;
  camps: boolean;
};

export type Trekker = {
  id: number;
  name: string;
  status: "active" | "idle" | "sos";
  x: number;
  y: number;
};