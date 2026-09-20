import { Map } from "lucide-react";
import LayerControls from "./LayerControls";

const MapHeader = ({ layers, setLayers }: any) => {
    return (
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
                <Map size={30} />
                <h3 className="text-2xl font-extrabold m-0">
                    Live Trek Monitoring
                </h3>
            </div>

            <LayerControls layers={layers} setLayers={setLayers} />
        </div>
    );
};

export default MapHeader;