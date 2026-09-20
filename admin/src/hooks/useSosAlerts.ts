import { useEffect, useState, useCallback } from "react";
import { getActiveSosAlerts, resolveSosAlert } from "@/api/emergency";
import type { SosAlert } from "@/types/sos";

export function useSosAlerts(pollMs = 8000) {
  const [alerts, setAlerts] = useState<SosAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await getActiveSosAlerts();
      setAlerts(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch SOS alerts");
    } finally {
      setLoading(false);
    }
  }, []);

  const resolve = useCallback(
    async (id: number) => {
      setResolvingId(id);
      try {
        await resolveSosAlert(id);
        // Optimistic update — agad tanggalin sa list bago pa mag-refetch
        setAlerts((prev) => prev.filter((a) => a.id !== id));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to resolve alert");
        await fetchAlerts(); // rollback kung nag-fail
      } finally {
        setResolvingId(null);
      }
    },
    [fetchAlerts],
  );

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, pollMs);
    return () => clearInterval(interval);
  }, [fetchAlerts, pollMs]);

  return { alerts, loading, error, resolvingId, refetch: fetchAlerts, resolve };
}