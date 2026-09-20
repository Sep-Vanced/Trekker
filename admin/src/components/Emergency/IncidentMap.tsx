import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { AlertTriangle, Clock, MapPin, Phone, User } from "lucide-react";
import { useSosAlerts } from "@/hooks/useSosAlerts";
import type { SosAlert } from "@/types/sos";
import SanMarcelinoBoundary from "./SanMarcelinoBoundary";

const CENTER: [number, number] = [14.99, 120.23];

const PALETTE = {
    bg: "#F4F4F4",
    orange: "#FF6B35",
    dark: "#0C1618",
};

const createSosIcon = () => {
    const iconMarkup = renderToStaticMarkup(
        <div className="relative flex items-center justify-center">
            <div
                className="absolute w-12 h-12 rounded-full animate-ping opacity-20"
                style={{ backgroundColor: PALETTE.orange }}
            />
            <div className="relative drop-shadow-xl transition-all duration-500 hover:scale-110">
                <svg width="36" height="42" viewBox="0 0 36 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M18 42C18 42 36 28.6602 36 18C36 8.05887 27.9411 0 18 0C8.05887 0 0 8.05887 0 18C0 28.6602 18 42 18 42Z"
                        fill="white"
                    />
                    <path
                        d="M18 39C18 39 33 27.8835 33 18C33 9.71573 26.2843 3 18 3C9.71573 3 3 9.71573 3 18C3 27.8835 18 39 18 39Z"
                        fill={PALETTE.orange}
                    />
                    <g transform="translate(10, 10)">
                        <foreignObject width="16" height="16">
                            <div className="flex items-center justify-center w-full h-full text-white">
                                <AlertTriangle size={14} strokeWidth={3} />
                            </div>
                        </foreignObject>
                    </g>
                </svg>
            </div>
        </div>
    );

    return L.divIcon({
        html: iconMarkup,
        className: "custom-incident-marker",
        iconSize: [36, 42],
        iconAnchor: [18, 42],
        popupAnchor: [0, -42],
    });
};

const IncidentMap = () => {
    const { alerts } = useSosAlerts();

    // Wala tayong location kung wala talagang GPS na na-share (pwede null si lat/lng)
    const mappable = alerts.filter(
        (a: SosAlert) => a.latitude != null && a.longitude != null,
    );

    return (
        <div className="h-full w-full rounded-[2.5rem] overflow-hidden border border-black/5 shadow-inner bg-[#F4F4F4]">
            <style>{`
                .leaflet-popup-content-wrapper {
                    background: #F4F4F4 !important;
                    color: #0C1618 !important;
                    border-radius: 1.5rem !important;
                    padding: 0 !important;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
                    border: 1px solid rgba(12, 22, 24, 0.05);
                }
                .leaflet-popup-content { margin: 0 !important; width: 280px !important; }
                .leaflet-popup-tip { background: #F4F4F4 !important; border: 1px solid rgba(12, 22, 24, 0.05); }
            `}</style>

            <MapContainer
                center={CENTER}
                zoom={12}
                zoomControl={false}
                attributionControl={false}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <SanMarcelinoBoundary />

                {mappable.map((alert: SosAlert) => (
                    <Marker
                        key={alert.id}
                        position={[alert.latitude as number, alert.longitude as number]}
                        icon={createSosIcon()}
                    >
                        <Popup closeButton={false}>
                            <div className="p-1 min-w-64 font-sans bg-[#F4F4F4] rounded-3xl overflow-hidden">
                                <div className="flex items-center gap-3 px-5 py-4 border-b border-[#0C1618]/5 bg-white/50">
                                    <div
                                        className="p-2.5 rounded-xl shadow-sm border border-[#FF6B35]/10"
                                        style={{ backgroundColor: `${PALETTE.orange}15` }}
                                    >
                                        <AlertTriangle size={18} className="text-[#FF6B35]" strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 className="text-[12px] font-black text-[#0C1618] leading-none tracking-wider uppercase">
                                            SOS Signal
                                        </h4>
                                        <span className="text-[9px] font-bold text-[#0C1618]/40 tracking-widest uppercase mt-1">
                                            Ref #{String(alert.id).padStart(4, "0")}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-[#0C1618]">
                                            <User size={13} className="text-[#FF6B35]" />
                                            <p className="text-[13px] font-extrabold leading-tight tracking-tight">
                                                {alert.trekker.name}
                                            </p>
                                        </div>
                                        {alert.message && (
                                            <p className="text-[12px] text-[#0C1618]/60 italic">
                                                "{alert.message}"
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2.5 pt-3 border-t border-[#0C1618]/5">
                                        {alert.trekker.phone && (
                                            <div className="flex items-center gap-2.5 text-[#0C1618]/70 text-[11px] font-medium">
                                                <div className="p-1 bg-white rounded-md shadow-sm border border-black/5">
                                                    <Phone size={12} className="text-[#FF6B35]" />
                                                </div>
                                                <span>{alert.trekker.phone}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2.5 text-[#0C1618]/70 text-[11px] font-medium">
                                            <div className="p-1 bg-white rounded-md shadow-sm border border-black/5">
                                                <MapPin size={12} className="text-[#FF6B35]" />
                                            </div>
                                            <span>
                                                {(alert.latitude as number).toFixed(5)}, {(alert.longitude as number).toFixed(5)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-[#0C1618]/50 text-[10px] font-semibold">
                                            <div className="p-1 bg-white rounded-md shadow-sm border border-black/5">
                                                <Clock size={12} />
                                            </div>
                                            <span>
                                                {new Date(alert.created_at).toLocaleString("en-PH", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default IncidentMap;