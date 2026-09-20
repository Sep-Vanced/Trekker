import React from 'react';
import { Layers, Users, TriangleAlert, TentTree, MapPin } from "lucide-react";

type LayerState = {
    trekkers: boolean;
    hazards: boolean;
    camps: boolean;
};

type Props = {
    layers: LayerState;
    setLayers: React.Dispatch<React.SetStateAction<LayerState>>;
};

const LayerControls = ({ layers, setLayers }: Props) => {
    // High-end Palette Mapping base sa iyong preference
    const config = {
        trekkers: {
            label: "Trekkers",
            icon: <Users size={14} strokeWidth={2.5} />,
            color: "#0C8345"
        },
        hazards: {
            label: "Hazards",
            icon: <TriangleAlert size={14} strokeWidth={2.5} />,
            color: "#FF6B35"
        },
        camps: {
            label: "Camps",
            icon: <TentTree size={14} strokeWidth={2.5} />,
            color: "#F5BB00"
        },
    };

    return (
        <div className="bg-white/40 backdrop-blur-2xl border border-white/40 p-5 rounded-[2.5rem] shadow-2xl shadow-[#0C1618]/5 flex flex-col gap-5">

            {/* Header Section */}
            <div className="flex items-center gap-3 px-1">
                <div className="p-2.5 bg-[#0C1618] rounded-2xl text-white shadow-lg shadow-[#0C1618]/20">
                    <Layers size={16} strokeWidth={2.5} />
                </div>
                <div>
                    <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-[#0C1618]">
                        Map Layers
                    </span>
                    <span className="text-[9px] font-bold text-[#0C1618]/40 uppercase tracking-widest">
                        Institutional Node
                    </span>
                </div>
            </div>

            {/* Dynamic Layer Buttons */}
            <div className="flex flex-col gap-2.5">
                {(Object.keys(layers) as Array<keyof LayerState>).map((layer) => {
                    const isActive = layers[layer];
                    const layerConfig = config[layer];
                    const activeColor = layerConfig?.color || "#0C8345";

                    return (
                        <button
                            key={layer}
                            onClick={() => setLayers(prev => ({ ...prev, [layer]: !prev[layer] }))}
                            className={`flex items-center justify-between p-3.5 rounded-3xl transition-all duration-500 group relative overflow-hidden ${isActive
                                ? 'bg-white shadow-xl shadow-black/5'
                                : 'bg-[#F4F4F4]/50 hover:bg-white/80'
                                }`}
                        >
                            <div className="flex items-center gap-3 z-10">
                                <div
                                    className={`transition-all duration-300 ${isActive ? '' : 'opacity-30'}`}
                                    style={{ color: isActive ? activeColor : '#0C1618' }}
                                >
                                    {layerConfig?.icon || <MapPin size={14} />}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-wider transition-colors duration-300 ${isActive ? 'text-[#0C1618]' : 'text-[#0C1618]/40'
                                    }`}>
                                    {layerConfig?.label || layer}
                                </span>
                            </div>

                            {/* Premium Status Indicator Dot */}
                            <div
                                className={`w-2 h-2 rounded-full transition-all duration-700 z-10 ${isActive ? 'scale-100' : 'scale-50 opacity-20 bg-[#0C1618]'
                                    }`}
                                style={{
                                    backgroundColor: isActive ? activeColor : undefined,
                                    boxShadow: isActive ? `0 0 12px ${activeColor}80` : 'none'
                                }}
                            />

                            {/* Subtle Active Background Glow */}
                            {isActive && (
                                <div
                                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                                    style={{ backgroundColor: activeColor }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default LayerControls;