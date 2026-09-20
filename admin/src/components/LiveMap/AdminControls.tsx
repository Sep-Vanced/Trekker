import React from 'react';
import { Waves, Mountain, TriangleAlert, ShieldCheck, XCircle } from "lucide-react";

type Props = {
    actions: {
        lakeClosed: boolean;
        uplandRestricted: boolean;
        evacuation: boolean;
    };
    setActions: React.Dispatch<React.SetStateAction<any>>;
};

const PALETTE = {
    bg: "#F4F4F4",
    orange: "#FF6B35",
    yellow: "#F5BB00",
    green: "#0C8345",
    dark: "#0C1618",
};

const AdminControls = ({ actions, setActions }: Props) => {
    const toggleAction = (key: string) => {
        setActions((prev: any) => ({
            ...prev,
            [key]: !prev[key as keyof typeof actions],
        }));
    };

    const controlButtons = [
        {
            id: "lakeClosed",
            label: "Lake Access",
            active: actions.lakeClosed,
            icon: Waves,
            activeColor: PALETTE.orange,
        },
        {
            id: "uplandRestricted",
            label: "Upland Zone",
            active: actions.uplandRestricted,
            icon: Mountain,
            activeColor: PALETTE.yellow,
        },
        {
            id: "evacuation",
            label: "Evacuation",
            active: actions.evacuation,
            icon: TriangleAlert,
            activeColor: PALETTE.orange,
        }
    ];

    return (
        /* Floating horizontal bar with heavy glassmorphism */
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] z-1000">
            {controlButtons.map((btn) => (
                <button
                    key={btn.id}
                    onClick={() => toggleAction(btn.id)}
                    className="group relative flex items-center gap-3 px-4 py-2.5 rounded-4xl transition-all duration-500 hover:bg-white/80 active:scale-95 border border-transparent hover:border-black/3"
                >
                    {/* Icon with dynamic status color */}
                    <div
                        className="relative p-2 rounded-full transition-all duration-500 shadow-sm"
                        style={{
                            backgroundColor: btn.active ? btn.activeColor : 'white',
                            color: btn.active ? 'white' : '#64748b'
                        }}
                    >
                        <btn.icon size={18} strokeWidth={2.5} />

                        {/* Status Indicator Dot Only (Minimalist) */}
                        <div className="absolute -top-0.5 -right-0.5 border-2 border-white rounded-full">
                            {btn.active ? (
                                <XCircle size={10} fill={btn.activeColor} className="text-white" />
                            ) : (
                                <ShieldCheck size={10} fill={PALETTE.green} className="text-white" />
                            )}
                        </div>
                    </div>

                    {/* Minimalist Labels */}
                    <div className="flex flex-col items-start leading-tight">
                        <span className="text-[9px] font-black uppercase tracking-widest text-black/40">
                            {btn.label}
                        </span>
                        <span className={`text-[12px] font-bold tracking-tight transition-colors ${btn.active ? 'text-black' : 'text-black/60'}`}>
                            {btn.active ? "Restricted" : "Open"}
                        </span>
                    </div>

                    {/* Premium active glow effect */}
                    {btn.active && (
                        <div
                            className="absolute inset-0 rounded-4xl opacity-[0.05] pointer-events-none"
                            style={{ backgroundColor: btn.activeColor }}
                        />
                    )}
                </button>
            ))}
        </div>
    );
};

export default AdminControls;