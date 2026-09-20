import { useState, useEffect } from "react";
import TouristsStats from "@components/TouristsManagement/TouristsStats";
import TouristsFilter from "@components/TouristsManagement/TouristsFilter";
import TouristsTable from "@components/TouristsManagement/TouristsTable";
import Pagination from "@components/TouristsManagement/Pagination";
import { fetchTourists } from "@/api/tourism";
import type { Tourist, TouristStatus } from "@/types/tourist";

const TouristManagement = () => {
    const [tourists, setTourists] = useState<Tourist[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<TouristStatus | "">("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        fetchTourists()
            .then(setTourists)
            .catch((err) => setError(err instanceof Error ? err.message : "Failed to load tourists"))
            .finally(() => setLoading(false));
    }, []);

    const filteredTourists = tourists.filter((t) => {
        const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = status === "" || t.status === status;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredTourists.length / itemsPerPage);
    const paginatedTourists = filteredTourists.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="min-h-screen bg-[#F4F4F4] font-['Plus_Jakarta_Sans',sans-serif] text-[#0C1618] px-6 py-8 md:px-8 md:py-8">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

            {/* ── HEADER SECTION ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
                <div className="space-y-3">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#0C1618]">
                        Tourist <span className="text-[#0C8345]">Management</span>
                    </h1>
                    <p className="text-sm font-medium text-[#0C1618]/60 max-w-md leading-relaxed">
                        Centralized registry for <span className="text-[#0C8345] font-bold">San Marcelino, Zambales</span>.
                        Managing <span className="text-[#FF6B35] font-bold text-xs uppercase ml-1 tracking-wider">Trekker Profiles</span> and vehicle logistics.
                    </p>
                </div>

                <div className="w-full md:w-auto">
                    <TouristsFilter
                        search={search}
                        setSearch={setSearch}
                        status={status}
                        setStatus={setStatus}
                    />
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center text-[#0C1618]/40 font-bold uppercase tracking-widest text-sm">
                    Loading registry...
                </div>
            ) : error ? (
                <div className="py-20 text-center text-red-500 font-bold">{error}</div>
            ) : (
                <>
                    {/* ── STATS SECTION ── */}
                    <div className="mb-10">
                        <TouristsStats tourists={tourists} />
                    </div>

                    {/* ── DATA SECTION ── */}
                    <div className="space-y-6">
                        <TouristsTable tourists={paginatedTourists} />

                        <div className="flex justify-between items-center mt-8 px-2">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalResults={filteredTourists.length}
                                pageSize={itemsPerPage}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TouristManagement;