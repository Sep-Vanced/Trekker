import React, { createContext, useContext, useState, ReactNode } from "react";
import { Camp, Checkpoint, CHECKPOINTS } from "../data/staticData";

type TrekSession = {
  camp: Camp;
  startTime: Date;
  distanceTraveled: number;
  steps: number;
  elevationGained: number;
  completedCheckpoints: string[];
  currentCheckpointIndex: number;
  isActive: boolean;
};

type TrekContextType = {
  session: TrekSession | null;
  startTrek: (camp: Camp) => void;
  endTrek: () => void;
  completeCheckpoint: (id: string) => void;
  getRouteCheckpoints: (campId: string) => Checkpoint[];
};

const TrekContext = createContext<TrekContextType | undefined>(undefined);

export function TrekProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<TrekSession | null>(null);

  const getRouteCheckpoints = (campId: string) =>
    CHECKPOINTS.filter((c) => c.campId === campId);

  const startTrek = (camp: Camp) => {
    setSession({
      camp,
      startTime: new Date(),
      distanceTraveled: 0,
      steps: 0,
      elevationGained: 0,
      completedCheckpoints: [],
      currentCheckpointIndex: 0,
      isActive: true,
    });
  };

  const endTrek = () => setSession(null);

  const completeCheckpoint = (id: string) => {
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        completedCheckpoints: [...prev.completedCheckpoints, id],
        currentCheckpointIndex: prev.currentCheckpointIndex + 1,
      };
    });
  };

  return (
    <TrekContext.Provider value={{ session, startTrek, endTrek, completeCheckpoint, getRouteCheckpoints }}>
      {children}
    </TrekContext.Provider>
  );
}

export function useTrek() {
  const ctx = useContext(TrekContext);
  if (!ctx) throw new Error("useTrek must be used within TrekProvider");
  return ctx;
}