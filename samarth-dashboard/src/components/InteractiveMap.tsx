// src/components/InteractiveMap.tsx
import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { District } from "../types";

type Props = {
  districts?: District[];
  onDistrictClick?: (districtName: string | null) => void;
};

function getColor(hps: number) {
  if (hps >= 80) return "#16a34a"; // Green
  if (hps >= 70) return "#4ade80";
  if (hps >= 60) return "#facc15"; // Yellow
  if (hps >= 50) return "#fb923c"; // Orange
  return "#ef4444"; // Red
}

export default function InteractiveMap({ districts = [], onDistrictClick }: Props) {
  const [geoJson, setGeoJson] = useState<any | null>(null);

  const districtsMap = useMemo(() => {
    const map = new Map<string, District>();
    districts.forEach(district => { if (district.district_name) map.set(district.district_name.trim().toLowerCase(), district) });
    return map;
  }, [districts]);

  useEffect(() => {
    fetch("/odisha_districts.geojson").then(res => res.json()).then(data => setGeoJson(data)).catch(e => console.error("Failed to load geojson:", e));
  }, []);

  const getFeatureName = (feature: any): string | null => {
    const p = feature?.properties || {};
    const keysToTry = ["DISTRICT", "DIST_NAME", "dtname", "NAME_1", "district_name", "name"];
    for (const key of keysToTry) { if (p[key] && typeof p[key] === 'string') return p[key] }
    return null;
  };

  const onEachFeature = (feature: any, layer: any) => {
    const featureName = getFeatureName(feature);
    const districtData = featureName ? districtsMap.get(featureName.trim().toLowerCase()) : undefined;

    console.log(`[MAP_DEBUG] GeoJSON Name: '${featureName}' ---> Match Found: ${districtData ? '✅ YES' : '❌ NO'}`);

    const displayName = featureName || "Unknown District";
    const hps = districtData?.hps_score?.toFixed(1) ?? "0";
    const officers = districtData?.officer_count ?? "—";

    layer.bindPopup(`<strong>${displayName}</strong><br/>HPS: ${hps}<br/>Officers: ${officers}`);

    layer.on({
      click: () => { onDistrictClick?.(districtData?.district_name ?? displayName) },
      mouseover: (e: any) => e.target.setStyle({ weight: 3, color: "#000", fillOpacity: 0.9 }),
      mouseout: () => {
        const originalStyle = { fillColor: getColor(districtData?.hps_score ?? 0), weight: 1, opacity: 1, color: "#2b2b2b", fillOpacity: 0.7 };
        layer.setStyle(originalStyle);
      },
    });
  };

  const styleFeature = (feature: any) => {
    const featureName = getFeatureName(feature);
    const districtData = featureName ? districtsMap.get(featureName.trim().toLowerCase()) : undefined;
    const hps = districtData?.hps_score ?? 0;
    return { fillColor: getColor(hps), weight: 1, opacity: 1, color: "#2b2b2b", fillOpacity: 0.7 };
  };

  const mapCenter: [number, number] = [20.9517, 85.0985];

  if (!geoJson) { return <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 text-gray-500">Loading Map...</div> }

  return (
    <MapContainer center={mapCenter} zoom={7} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <GeoJSON key={JSON.stringify(districts)} data={geoJson} style={styleFeature} onEachFeature={onEachFeature} />
    </MapContainer>
  );
}