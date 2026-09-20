"use client";

import { ArrowLeft, RefreshCw, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Registration {
  id: number;
  permit_number: string;
  name: string;
  username: string;
  route_name: string;
  status: string;
  group_size: number;
  age: number | null;
  citizen: string | null;
  place: string | null;
  pax: number;
  planned_entry: string;
  planned_exit: string;
  actual_entry: string | null;
  actual_exit: string | null;
  is_overdue: boolean;
  registered_at: string;
}

export default function RegistrationsScreen() {
  const [data, setData] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async (p = 1) => {
    try {
      const res = await fetch(
        `/api/tourism/ranger/registrations?page=${p}&page_size=20`,
      );
      const payload = await res.json();
      setTotalPages(payload.pages);
      setData(payload.results ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `/api/tourism/ranger/registrations?page=1&page_size=20`,
        );
        const payload = await res.json();
        setTotalPages(payload.pages);
        setData(payload.results ?? []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="px-5 pt-5 pb-5 bg-green-900">
        <Link
          href="/ranger/dashboard"
          className="flex flex-row items-center mb-3"
        >
          <ArrowLeft size={16} color="#4cde80" />
          <span className="text-[#4cde80] text-xs font-semibold ml-1">
            Dashboard
          </span>
        </Link>
        <p className="text-[#4cde80] text-[11px] font-bold uppercase tracking-widest mb-1">
          Ranger Control
        </p>
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-white text-2xl font-extrabold tracking-tight">
            Tourists
          </h1>
          <button
            onClick={() => fetchData(1)}
            className="px-3 py-1.5 rounded-full bg-[rgba(76,222,128,0.12)]"
          >
            <RefreshCw size={14} color="#4cde80" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-green-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="p-5 pb-24 bg-gray-50 min-h-screen">
          {data.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Users size={32} color="#d1d5db" />
              </div>
              <p className="text-gray-400 text-[13px] font-medium">
                No registrations yet
              </p>
            </div>
          ) : (
            <>
              {data.map((item) => {
                const statusCfg: Record<string, string> = {
                  registered: "bg-green-100 text-green-700",
                  completed: "bg-gray-100 text-gray-600",
                  cancelled: "bg-red-100 text-red-700",
                  overdue: "bg-amber-100 text-amber-700",
                };
                const statusColor =
                  statusCfg[item.status] ?? statusCfg.registered;
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl p-4 mb-3 bg-white border border-gray-100 shadow-sm"
                  >
                    <div className="flex flex-row items-center justify-between mb-3">
                      <div className="flex flex-row items-center gap-2 flex-1">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-100">
                          <Users size={16} color="#16a34a" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-bold text-gray-800 truncate">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate">
                            {item.permit_number}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${statusColor}`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-row justify-between">
                        <span className="text-[11px] capitalize text-gray-400">
                          Route
                        </span>
                        <span className="text-[11px] font-medium text-gray-600">
                          {item.route_name}
                        </span>
                      </div>
                      <div className="flex flex-row justify-between">
                        <span className="text-[11px] capitalize text-gray-400">
                          Group
                        </span>
                        <span className="text-[11px] font-medium text-gray-600">
                          {item.group_size}
                        </span>
                      </div>
                      {item.age != null && (
                        <div className="flex flex-row justify-between">
                          <span className="text-[11px] capitalize text-gray-400">
                            Age
                          </span>
                          <span className="text-[11px] font-medium text-gray-600">
                            {item.age}
                          </span>
                        </div>
                      )}
                      {item.citizen && (
                        <div className="flex flex-row justify-between">
                          <span className="text-[11px] capitalize text-gray-400">
                            Citizen
                          </span>
                          <span className="text-[11px] font-medium text-gray-600">
                            {item.citizen}
                          </span>
                        </div>
                      )}
                      {item.place && (
                        <div className="flex flex-row justify-between">
                          <span className="text-[11px] capitalize text-gray-400">
                            Place
                          </span>
                          <span className="text-[11px] font-medium text-gray-600">
                            {item.place}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-row justify-between">
                        <span className="text-[11px] capitalize text-gray-400">
                          Pax
                        </span>
                        <span className="text-[11px] font-medium text-gray-600">
                          {item.pax}
                        </span>
                      </div>
                      <div className="flex flex-row justify-between">
                        <span className="text-[11px] capitalize text-gray-400">
                          Entry
                        </span>
                        <span className="text-[11px] font-medium text-gray-600">
                          {new Date(item.planned_entry).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex flex-row justify-between">
                        <span className="text-[11px] capitalize text-gray-400">
                          Exit
                        </span>
                        <span className="text-[11px] font-medium text-gray-600">
                          {new Date(item.planned_exit).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {page < totalPages && (
                <button
                  onClick={() => {
                    const next = page + 1;
                    setPage(next);
                    fetchData(next);
                  }}
                  className="w-full py-3 rounded-2xl bg-gray-100 text-gray-600 text-sm font-bold"
                >
                  Load More
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
