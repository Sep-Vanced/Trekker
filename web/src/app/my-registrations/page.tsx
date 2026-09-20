"use client";

import { TabLayout } from "@/components/trekker/TabLayout";
import { MyRegistration } from "@/types/trekking-types";
import {
  AlertTriangle,
  ChevronRight,
  FileText,
  RefreshCw,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> =
  {
    registered: {
      bg: "bg-canopy-100",
      text: "text-canopy-700",
      dot: "#22c55e",
    },
    completed: { bg: "bg-parchment-100", text: "text-bark-500", dot: "#94a3b8" },
    cancelled: { bg: "bg-rust-100", text: "text-rust-600", dot: "#ef4444" },
    overdue: { bg: "bg-amber-100", text: "text-amber-700", dot: "#f59e0b" },
  };

type Tab = "active" | "history";

export default function MyRegistrations() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("active");
  const [activeItems, setActiveItems] = useState<MyRegistration[]>([]);
  const [historyItems, setHistoryItems] = useState<MyRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const [activeRes, histRes] = await Promise.all([
        fetch("/api/tourism/my-registrations"),
        fetch("/api/tourism/my-registrations/history"),
      ]);
      const activeData = await activeRes.json();
      const histData = await histRes.json();
      setActiveItems(activeData.results ?? []);
      setHistoryItems(histData.results ?? []);
    } catch {
      setError("Failed to load registrations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [activeRes, histRes] = await Promise.all([
          fetch("/api/tourism/my-registrations"),
          fetch("/api/tourism/my-registrations/history"),
        ]);
        const activeData = await activeRes.json();
        const histData = await histRes.json();
        setActiveItems(activeData.results ?? []);
        setHistoryItems(histData.results ?? []);
      } catch {
        setError("Failed to load registrations. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const currentItems = tab === "active" ? activeItems : historyItems;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <TabLayout>
      <div className="min-h-screen bg-topo">
        {/* ── Expedition Header ─────────────────────────────────────── */}
        <div className="bg-expedition rounded-2xl p-6 lg:p-8 shadow-xl mb-6 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <p className="font-utility text-canopy-300 text-[11px] font-bold uppercase tracking-[0.25em]">
                Tourism
              </p>
              <h1 className="text-white text-3xl lg:text-4xl font-display font-bold mt-1 leading-none">
                My Registrations
              </h1>
              <p className="text-canopy-200 text-sm mt-3">
                View and manage your travel passes
              </p>
            </div>
            <button
              onClick={() => fetchAll(true)}
              className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-lg hover:bg-white/20 transition-colors shrink-0"
            >
              <RefreshCw size={16} className="text-white" />
              <span className="text-white text-sm font-semibold">Refresh</span>
            </button>
          </div>
        </div>

        {/* ── Tab Switcher ──────────────────────────────────────────── */}
        <div className="flex flex-row bg-parchment-200/60 rounded-xl p-1 gap-1 mb-6 border border-bark-100">
          {(["active", "history"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-lg flex items-center justify-center transition-colors ${
                tab === t ? "bg-canopy-800 shadow-sm" : "hover:bg-parchment-100"
              }`}
            >
              <span
                className={`text-xs font-bold capitalize mx-1.5 ${
                  tab === t ? "text-parchment-50" : "text-bark-700"
                }`}
              >
                {t === "active" ? "Active" : "History"}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded-full ${
                  tab === t ? "bg-canopy-700" : "bg-parchment-200"
                }`}
              >
                <span
                  className={`text-[10px] font-bold ${
                    tab === t ? "text-white" : "text-bark-700"
                  }`}
                >
                  {t === "active" ? activeItems.length : historyItems.length}
                </span>
              </span>
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex flex-col items-center py-16">
            <div className="w-8 h-8 border-2 border-bark-300 border-t-canopy-600 rounded-full animate-spin" />
            <p className="text-bark-500 text-sm mt-3">Loading registrations…</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-rust-100/50 border border-rust-100 rounded-xl p-4 mb-4 flex items-center gap-3">
            <AlertTriangle size={18} className="text-rust-500 shrink-0" />
            <span className="flex-1 text-sm text-rust-600">{error}</span>
            <button
              onClick={() => fetchAll()}
              className="text-xs text-rust-600 font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && currentItems.length === 0 && (
          <div className="bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] flex flex-col items-center py-12 px-8">
            <div className="w-16 h-16 rounded-2xl bg-parchment-100 flex items-center justify-center mb-3">
              <FileText size={32} color="#a89b84" />
            </div>
            <p className="text-bark-500 text-sm text-center">
              {tab === "active"
                ? "No active registrations. Register for a route to get started."
                : "No past registrations found."}
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          currentItems.map((item) => {
            const statusCfg =
              STATUS_CONFIG[item.status] ?? STATUS_CONFIG.registered;
            return (
              <button
                key={item.id}
                onClick={() =>
                  router.push(
                    `/registration-detail?permit=${item.permit_number}`,
                  )
                }
                className="w-full bg-white rounded-xl mb-3 overflow-hidden border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] hover:shadow-md transition-shadow text-left"
              >
                <div
                  className="h-[3px] w-full"
                  style={{ backgroundColor: statusCfg.dot }}
                />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 mr-3">
                      <p className="text-bark-900 text-sm font-bold font-display leading-5">
                        {item.route_name}
                      </p>
                      <p className="text-canopy-700 text-xs font-bold mt-0.5">
                        {item.permit_number}
                      </p>
                    </div>
                    <span
                      className={`flex items-center px-2.5 py-1 rounded-full ${statusCfg.bg}`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: statusCfg.dot }}
                      />
                      <span
                        className={`text-[10px] font-bold capitalize ml-1.5 ${statusCfg.text}`}
                      >
                        {item.status}
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-row gap-2 mb-3 flex-wrap">
                    <span className="flex items-center gap-1 bg-parchment-100 px-2.5 py-1 rounded-lg border border-bark-100">
                      <Users size={11} color="#6f6350" />
                      <span className="text-bark-500 text-[11px] font-semibold">
                        {item.group_size}{" "}
                        {item.group_size === 1 ? "person" : "people"}
                      </span>
                    </span>
                    {item.age != null && (
                      <span className="flex items-center gap-1 bg-parchment-100 px-2.5 py-1 rounded-lg border border-bark-100">
                        <Users size={11} color="#6f6350" />
                        <span className="text-bark-500 text-[11px] font-semibold">
                          {item.age} yrs
                        </span>
                      </span>
                    )}
                    {item.citizen && (
                      <span className="flex items-center gap-1 bg-parchment-100 px-2.5 py-1 rounded-lg border border-bark-100">
                        <Users size={11} color="#6f6350" />
                        <span className="text-bark-500 text-[11px] font-semibold">
                          {item.citizen}
                        </span>
                      </span>
                    )}
                    {item.place && (
                      <span className="flex items-center gap-1 bg-parchment-100 px-2.5 py-1 rounded-lg border border-bark-100">
                        <Users size={11} color="#6f6350" />
                        <span className="text-bark-500 text-[11px] font-semibold">
                          {item.place}
                        </span>
                      </span>
                    )}
                    <span className="flex items-center gap-1 bg-parchment-100 px-2.5 py-1 rounded-lg border border-bark-100">
                      <Users size={11} color="#6f6350" />
                      <span className="text-bark-500 text-[11px] font-semibold">
                        {item.pax} pax
                      </span>
                    </span>
                    {item.is_overdue && (
                      <span className="flex items-center gap-1 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200">
                        <AlertTriangle size={11} color="#d97706" />
                        <span className="text-amber-700 text-[11px] font-bold">
                          Overdue
                        </span>
                      </span>
                    )}
                  </div>
                  <div className="flex flex-row gap-3">
                    <div className="flex-1 bg-parchment-100 rounded-xl p-2.5 border border-bark-100">
                      <p className="text-[9px] text-bark-500 font-bold uppercase tracking-[0.5px]">
                        Entry
                      </p>
                      <p className="text-xs text-bark-700 font-bold mt-0.5">
                        {formatDate(item.planned_entry)}
                      </p>
                    </div>
                    <div className="flex-1 bg-parchment-100 rounded-xl p-2.5 border border-bark-100">
                      <p className="text-[9px] text-bark-500 font-bold uppercase tracking-[0.5px]">
                        Exit
                      </p>
                      <p className="text-xs text-bark-700 font-bold mt-0.5">
                        {formatDate(item.planned_exit)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end mt-3">
                    <span className="text-canopy-700 text-[11px] font-bold mr-1">
                      View details & QR
                    </span>
                    <ChevronRight size={13} color="#366644" />
                  </div>
                </div>
              </button>
            );
          })}
      </div>
    </TabLayout>
  );
}
