import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LayerState } from "@/types/map";
import TrekkerLayer from "./TrekkerLayer";
import HazardLayer from "./HazardLayer";
import CampLayer from "./CampLayer";

const CENTER: [number, number] = [14.99, 120.23];
type AdminActions = {
    lakeClosed: boolean;
    uplandRestricted: boolean;
    evacuation: boolean;
};

const MapView = ({ layers, adminActions }: { layers: LayerState; adminActions: AdminActions }) => {
    return (
        <div className="h-full w-full rounded-xl overflow-hidden">
            <MapContainer
                key={JSON.stringify({ layers, adminActions })}
                center={CENTER}
                zoom={13}
                zoomControl={false}
                attributionControl={false}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {layers.trekkers && <TrekkerLayer adminActions={adminActions} />}
                {layers.hazards && <HazardLayer adminActions={adminActions} />}
                {layers.camps && <CampLayer adminActions={adminActions} />}
            </MapContainer>
        </div>
    );
};

export default MapView;