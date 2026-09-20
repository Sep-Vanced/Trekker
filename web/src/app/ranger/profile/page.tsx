"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft,
  LogOut,
  Mail,
  Phone,
  User,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-row items-center gap-3 py-3.5 border-b border-gray-100">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-green-100">
        <Icon size={14} color="#16a34a" />
      </div>
      <div className="flex-1">
        <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">
          {label}
        </p>
        <p className="text-gray-800 text-[13px] font-semibold mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function RangerProfile() {
  const { user, signOut } = useAuth();
  const initials =
    `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase() ||
    "R";

  return (
    <div className="min-h-screen bg-white">
      <div className="px-5 pt-5 pb-8 bg-green-900 flex flex-col items-center">
        <Link
          href="/ranger/dashboard"
          className="self-start flex flex-row items-center mb-4"
        >
          <ArrowLeft size={16} color="#4cde80" />
          <span className="text-[#4cde80] text-xs font-semibold ml-1">
            Dashboard
          </span>
        </Link>
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4 bg-[rgba(76,222,128,0.15)]">
          <span className="text-[#4cde80] text-3xl font-extrabold">
            {initials}
          </span>
        </div>
        <h1 className="text-white text-xl font-extrabold tracking-tight">
          {user?.first_name} {user?.last_name}
        </h1>
        <div className="flex flex-row items-center gap-1.5 mt-2">
          <div className="w-2 h-2 rounded-full bg-[#4cde80]" />
          <span className="text-[#4cde80] text-[12px] font-semibold capitalize">
            {user?.role ?? "Ranger"}
          </span>
        </div>
      </div>

      <div className="px-5 pt-4 pb-28 bg-gray-50 min-h-screen">
        <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-2">
          Personal Info
        </p>
        <div className="rounded-2xl px-4 bg-white border border-gray-100">
          <InfoRow icon={User} label="Username" value={user?.username ?? "—"} />
          <InfoRow icon={Mail} label="Email" value={user?.email ?? "—"} />
          <InfoRow icon={Phone} label="Phone" value={user?.phone ?? "—"} />
        </div>

        <button
          onClick={signOut}
          className="mt-8 w-full flex flex-row items-center justify-center rounded-xl py-3 bg-red-100 border border-red-200"
        >
          <LogOut size={18} color="#f87171" />
          <span className="text-red-400 text-[14px] font-bold mx-2">
            Sign Out
          </span>
        </button>
      </div>
    </div>
  );
}
