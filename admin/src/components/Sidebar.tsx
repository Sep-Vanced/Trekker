import { NavLink, useNavigate } from "react-router-dom";
import { clearToken } from "@/api/client";
import {
  LayoutDashboard,
  Map,
  Users,
  Siren,
  CloudRain,
  Truck,
  Route,
  Bell,
  WifiOff,
  BarChart3,
  Tent,
  ChevronRight,
  LogOut,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

type MenuItem = {
  name: string;
  path: string;
  Icon: LucideIcon;
  // set to true to hide the item from the sidebar (page not built yet)
  hidden?: boolean;
};

const menuItems: MenuItem[] = [
  { name: "Dashboard", path: "/", Icon: LayoutDashboard },
  { name: "Live Map", path: "/map", Icon: Map },
  { name: "Tourists", path: "/tourists", Icon: Users, hidden: true },
  { name: "Emergency", path: "/emergency", Icon: Siren },
  { name: "Weather", path: "/weather", Icon: CloudRain },
  { name: "Vehicles", path: "/vehicles", Icon: Truck },
  { name: "Routes", path: "/routes", Icon: Route, hidden: true },
  { name: "Alerts", path: "/alerts", Icon: Bell, hidden: true },
  { name: "Offline", path: "/offline", Icon: WifiOff, hidden: true },
  { name: "Analytics", path: "/analytics", Icon: BarChart3, hidden: true },
];

// Hidden items are filtered out, and a section with no visible items
// (e.g. "System" while Analytics is hidden) is dropped entirely.
const sections = [
  { label: "Operations", items: menuItems.slice(0, 5) },
  { label: "Management", items: menuItems.slice(5, 9) },
  { label: "System", items: menuItems.slice(9) },
]
  .map((s) => ({ ...s, items: s.items.filter((i) => !i.hidden) }))
  .filter((s) => s.items.length > 0);

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-67.5 bg-[#0C8345] text-[#F4F4F4] flex flex-col z-50  shadow-2xl">

      {/* ── LOGO ── */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/10">
            <Tent size={20} className="text-[#F5BB00]" strokeWidth={2.5} />
          </div>

          <div>
            <p className="text-sm font-bold tracking-tight">
              TrekAdmin
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck size={10} className="text-[#F5BB00]" />
              <span className="text-[9px] font-semibold text-[#F5BB00] tracking-widest">
                VERIFIED SYSTEM
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ── NAVIGATION ── */}
      <nav className="flex-1 overflow-y-auto py-5">
        {sections.map((section) => (
          <div key={section.label} className="mb-7">

            {/* Section Label */}
            <p className="px-7 mb-3 text-[10px] font-semibold text-white/50 tracking-widest uppercase">
              {section.label}
            </p>

            {section.items.map(({ name, path, Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/"}
                className={({ isActive }) => {
                  const base =
                    "group flex items-center justify-between mx-3 px-4 py-3 rounded-xl text-[13px] transition-all duration-300";

                  if (isActive) {
                    return `${base} bg-[#F4F4F4] text-[#0C8345] shadow-lg`;
                  }

                  return `${base} text-white/70 hover:bg-white/10 hover:text-white`;
                }}
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg transition-all ${isActive
                          ? "bg-[#F5BB00]/50"
                          : "bg-transparent group-hover:bg-white/10"
                          }`}
                      >
                        <Icon
                          size={16}
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                      </div>

                      <span className={isActive ? "font-semibold" : "font-medium"}>
                        {name}
                      </span>
                    </div>

                    <ChevronRight
                      size={14}
                      className={`transition-all duration-300 ${isActive
                        ? "opacity-100 translate-x-1"
                        : "opacity-0 group-hover:opacity-60"
                        }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* ── FOOTER ── */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur border border-white/10 hover:bg-white/15 transition">

          {/* Avatar */}
          <div className="w-9 h-9 rounded-lg bg-[#F5BB00] flex items-center justify-center text-xs font-bold text-[#0C1618]">
            A
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">
              Admin User
            </p>
            <p className="text-[10px] text-white/60">
              System Operator
            </p>
          </div>

          {/* Logout */}
          <LogOut
            size={16}
            onClick={handleLogout}
            className="text-white/60 cursor-pointer transition hover:text-[#FF6B35]"
          />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;