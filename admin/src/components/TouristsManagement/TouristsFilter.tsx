import type { TouristStatus } from "@/types/tourist";
import { Search, SlidersHorizontal } from "lucide-react";

interface Props {
    search: string;
    setSearch: (val: string) => void;
    status: string;
    setStatus: (val: TouristStatus | "") => void;
}

const TouristsFilter = ({ search, setSearch, status, setStatus }: Props) => {
    return (
        <div className="flex flex-col sm:flex-row items-center gap-3 p-2 bg-white/40 backdrop-blur-md rounded-3xl border border-black/3 shadow-sm">

            {/* ── SEARCH INPUT CONTAINER ── */}
            <div className="relative w-full group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-[#0C1618]/30 group-focus-within:text-[#0C8345] transition-colors" />
                </div>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    type="text"
                    placeholder="Search trekker or destination..."
                    className="block w-full pl-11 pr-4 py-3 bg-white/80 border border-black/5 text-[#0C1618] text-xs font-medium rounded-2xl focus:ring-2 focus:ring-[#0C8345]/20 focus:border-[#0C8345] transition-all outline-none placeholder:text-[#0C1618]/30 shadow-inner-sm"
                />
            </div>

            {/* ── STATUS DROPDOWN CONTAINER ── */}
            <div className="relative w-full sm:w-56 group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <SlidersHorizontal className="h-4 w-4 text-[#0C1618]/30 group-focus-within:text-[#0C8345] transition-colors" />
                </div>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TouristStatus | "")}
                    className="block w-full pl-11 pr-10 py-3 bg-white/80 border border-black/5 text-[#0C1618] font-bold text-[11px] uppercase tracking-wider rounded-2xl focus:ring-2 focus:ring-[#0C8345]/20 focus:border-[#0C8345] cursor-pointer appearance-none transition-all outline-none shadow-inner-sm"
                    style={{
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230C1618' stroke-opacity='0.3' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 1rem center",
                        backgroundSize: "0.8em",
                    }}
                >
                    <option value="" className="font-sans lowercase">All Registry</option>
                    <option value="Active" className="font-sans lowercase">Active</option>
                    <option value="Completed" className="font-sans lowercase">Completed</option>
                    <option value="Emergency" className="font-sans lowercase">Emergency</option>
                </select>
            </div>
        </div>
    );
};

export default TouristsFilter;