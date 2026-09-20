import { useEffect, useState, useCallback, useRef } from "react";
import { getActiveSosAlerts, resolveSosAlert } from "@/api/emergency";
import { SosAlert } from "@/types/sos-types";

export function useSosAlerts(pollMs = 8000) {
  const [alerts, setAlerts] = useState<SosAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAlerts = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const res = await getActiveSosAlerts();
      setAlerts(res.data.results);
    } catch (err) {
      console.log("Fetch SOS alerts error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const resolve = useCallback(async (id: number) => {
    setResolvingId(id);
    try {
      await resolveSosAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.log("Resolve SOS error:", err);
    } finally {
      setResolvingId(null);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    intervalRef.current = setInterval(() => fetchAlerts(), pollMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchAlerts, pollMs]);

  return {
    alerts,
    loading,
    refreshing,
    resolvingId,
    refetch: () => fetchAlerts(true),
    resolve,
  };
}