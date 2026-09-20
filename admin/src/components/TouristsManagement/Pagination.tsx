import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalResults?: number;
    pageSize?: number;
}

const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    totalResults = 0,
    pageSize = 10,
}: PaginationProps) => {
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const showMax = 5;

        if (totalPages <= showMax) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push("...");

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }

            if (currentPage < totalPages - 2) pages.push("...");
            if (!pages.includes(totalPages)) pages.push(totalPages);
        }
        return pages;
    };

    const startResult = totalResults === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endResult = Math.min(currentPage * pageSize, totalResults);

    // Common button style for reusability
    const baseBtnStyle = "flex items-center justify-center transition-all duration-200 rounded-xl border font-medium text-sm";

    return (
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 px-6 py-5 bg-[#F4F4F4]/50 rounded-2xl border border-[#0C1618]/5">

            {/* Professional Results Counter */}
            <div className="flex items-center gap-2 text-[#0C1618]/70 text-sm tracking-tight">
                Showing
                <span className="font-extrabold text-[#0C1618] underline decoration-[#F5BB00] decoration-2 underline-offset-4">
                    {startResult} — {endResult}
                </span>
                of
                <span className="font-extrabold text-[#0C1618]">
                    {totalResults}
                </span>
                Tourists
            </div>

            {/* Navigation Controls */}
            <nav className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`h-11 w-11 ${baseBtnStyle} 
            ${currentPage === 1
                            ? "bg-white/50 border-gray-200 text-gray-300 cursor-not-allowed"
                            : "bg-white border-[#0C1618]/10 text-[#0C1618] hover:border-[#FF6B35] hover:text-[#FF6B35] shadow-sm active:scale-95"
                        }`}
                >
                    <ChevronLeft size={20} strokeWidth={2.5} />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-[#0C1618]/5 shadow-inner">
                    {getPageNumbers().map((page, idx) => {
                        if (page === "...") {
                            return (
                                <div key={`dots-${idx}`} className="w-10 h-10 flex items-center justify-center text-gray-400">
                                    <MoreHorizontal size={18} />
                                </div>
                            );
                        }

                        const isCurrent = page === currentPage;
                        return (
                            <button
                                key={page}
                                onClick={() => onPageChange(Number(page))}
                                className={`h-10 min-w-10 px-2 ${baseBtnStyle} border-transparent
                  ${isCurrent
                                        ? "bg-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/30 ring-2 ring-[#FF6B35]/10"
                                        : "text-[#0C1618]/60 hover:bg-[#F4F4F4] hover:text-[#0C1618]"
                                    }`}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>

                {/* Next Button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`h-11 w-11 ${baseBtnStyle} 
            ${currentPage === totalPages
                            ? "bg-white/50 border-gray-200 text-gray-300 cursor-not-allowed"
                            : "bg-white border-[#0C1618]/10 text-[#0C1618] hover:border-[#FF6B35] hover:text-[#FF6B35] shadow-sm active:scale-95"
                        }`}
                >
                    <ChevronRight size={20} strokeWidth={2.5} />
                </button>
            </nav>
        </div>
    );
};

export default Pagination;