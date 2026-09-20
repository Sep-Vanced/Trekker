"use client";

import { Activity, AlertTriangle, BarChart3, ChevronDown, Home, LogOut, Map, Mountain, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";

const NAV_ITEMS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/routes", label: "Campsites", icon: Map },
  { href: "/trek", label: "Travel", icon: Activity },
  { href: "/dashboard", label: "Stats", icon: BarChart3 },
];

export function TabLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const result = await Swal.fire({
      title: "Sign out?",
      text: "Are you sure you want to end your session?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, sign out",
      confirmButtonColor: "#b5511f",
      cancelButtonColor: "#6f6350",
      background: "#fbfaf3",
      showCloseButton: true,
    });
    if (result.isConfirmed) {
      await signOut();
      router.push("/sign-in");
    }
  };

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : user?.username ?? "User";
  const initial = (user?.first_name || user?.username || "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-topo flex">
      {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 bg-canopy-950 fixed inset-y-0 left-0 z-40">
        <div className="px-6 py-7 border-b border-canopy-800/60">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-rust-500 flex items-center justify-center shrink-0 ring-4 ring-canopy-900">
              <Mountain size={20} color="#f4f1e4" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold text-parchment-50 leading-tight">Mapanuepe</p>
              <p className="font-utility text-[10px] uppercase tracking-[0.15em] text-canopy-300">Trail Management</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 py-8">
          <div className="relative">
            <div className="trail-line absolute left-[15px] top-4 bottom-4" />
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href} className="relative">
                    <Link href={item.href} className="group flex items-center gap-4 py-3 pl-0 pr-3">
                      <span className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isActive ? "bg-rust-500" : "bg-canopy-900 group-hover:bg-canopy-800 border border-canopy-700"
                      }`}>
                        <Icon size={15} color={isActive ? "#f4f1e4" : "#8bb695"} />
                      </span>
                      <span className={`font-body text-sm transition-colors ${
                        isActive ? "text-parchment-50 font-semibold" : "text-canopy-300 group-hover:text-canopy-100"
                      }`}>
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        <div className="px-6 py-5 border-t border-canopy-800/60">
          <p className="font-utility text-[10px] text-canopy-400 tracking-wide">v1.0.0 · San Marcelino, Zambales</p>
        </div>
      </aside>

      {/* ── Main Column ─────────────────────────────────────────────────── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen min-w-0">
        {/* ── Top Bar ──────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 bg-canopy-950/95 backdrop-blur border-b border-canopy-800/60 shadow-lg">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <Link href="/home" className="flex items-center gap-2.5 lg:hidden shrink-0">
              <div className="w-8 h-8 rounded-full bg-rust-500 flex items-center justify-center">
                <Mountain size={16} color="#f4f1e4" />
              </div>
              <span className="font-display font-semibold text-parchment-50">Mapanuepe Trail</span>
            </Link>
            <div className="hidden lg:block" />

            <div className="flex items-center gap-3 ml-auto">
              <Link href="/emergency" className="flex items-center gap-1.5 bg-rust-500 hover:bg-rust-600 px-3 py-1.5 rounded-lg transition-colors shadow-lg shadow-rust-600/30">
                <AlertTriangle size={14} className="text-white" />
                <span className="text-white text-xs font-bold tracking-wide">SOS</span>
              </Link>

              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen((o) => !o)} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-canopy-900 border border-canopy-700 hover:border-canopy-500 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-canopy-600 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{initial}</span>
                  </div>
                  <span className="hidden sm:block text-sm text-parchment-50 font-medium max-w-[120px] truncate">{displayName}</span>
                  <ChevronDown size={14} className={`text-canopy-300 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-parchment-50 border border-bark-100 rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-bark-100">
                      <p className="text-sm font-bold text-bark-900 truncate">{displayName}</p>
                      <p className="text-xs text-bark-500 truncate mt-0.5">{user?.email}</p>
                      {user?.role === "ranger" && (
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-rust-100 text-rust-600 text-[10px] font-bold uppercase tracking-wider">Ranger</span>
                      )}
                    </div>
                    <div className="py-1">
                      <button onClick={() => { setDropdownOpen(false); router.push("/profile"); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-bark-700 hover:bg-parchment-100 transition-colors">
                        <User size={16} className="text-canopy-600" />
                        Profile & Settings
                      </button>
                      <button onClick={handleSignOut} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rust-600 hover:bg-rust-100/50 transition-colors border-t border-bark-100">
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-8 pb-20 lg:pb-8 min-w-0">
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Nav ───────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-canopy-950 pb-[env(safe-area-inset-bottom)] border-t border-canopy-800/60">
        <div className="flex items-stretch justify-between px-2 pt-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center gap-1 pb-2">
                <span className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform ${
                  isActive ? "bg-rust-500 -translate-y-1.5" : "bg-transparent"
                }`}>
                  <Icon size={17} color={isActive ? "#f4f1e4" : "#8bb695"} />
                </span>
                <span className={`font-utility text-[9px] uppercase tracking-wide ${
                  isActive ? "text-parchment-50" : "text-canopy-400"
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
