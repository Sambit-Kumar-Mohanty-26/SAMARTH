// src/components/InteractiveMap.tsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { District } from "../types";

type Props = {
  districts?: District[]; // from Firestore hook
  onDistrictClick?: (districtName: string | null) => void;
};

function getColor(hps: number) {
  if (hps >= 80) return "#1f9f46";
  if (hps >= 60) return "#7bd389";
  if (hps >= 40) return "#ffd54f";
  if (hps >= 20) return "#ffb86b";
  return "#ff6b6b";
}

export default function InteractiveMap({ districts = [], onDistrictClick }: Props) {
  const [geoJson, setGeoJson] = useState<any | null>(null);

  useEffect(() => {
    fetch("/odisha_districts.geojson") // change this name if your file is different
      .then((r) => {
        if (!r.ok) throw new Error("Network response not ok: " + r.status);
        return r.json();
      })
      .then((g) => {
        console.log("Loaded geojson -> features count:", g.features?.length);
        console.log("First feature properties:", g.features?.[0]?.properties);
        setGeoJson(g);
      })
      .catch((e) => {
        console.error("Failed to load geojson:", e);
      });
  }, []);

  // Robust feature name extraction (tries many common keys)
  const getFeatureName = (feature: any) => {
    const p = feature?.properties || {};
    const keysToTry = [
      "DISTRICT",
      "DIST_NAME",
      "DIST_NAME_ENG",
      "DIST",
      "DISTNAME",
      "NAME",
      "NAME_1",
      "NAME_2",
      "District",
      "district",
      "DISTRICT_N",
      "DISTRICT_NA",
      "DISTRICT_NM",
      "DISTRICTNA",
      "DISTRICTNAME",
    ];

    for (const k of keysToTry) {
      if (p[k]) return String(p[k]);
    }
    // try any string property
    for (const k of Object.keys(p)) {
      if (typeof p[k] === "string" && p[k].trim().length > 0) return String(p[k]);
    }
    return feature?.id ?? null;
  };

  const findDistrictData = (featureName?: string | null) => {
    if (!featureName) return null;
    const name = featureName.trim().toLowerCase();
    return districts.find((d) => {
      if (!d?.district_name) return false;
      const dn = d.district_name.trim().toLowerCase();
      return dn === name || name.includes(dn) || dn.includes(name);
    }) ?? null;
  };

  const styleFeature = (feature: any) => {
    // TEMP TEST COLOR: if you want to force red for debug, uncomment next line
    // return { fillColor: '#ff0000', weight: 1, color: '#222', fillOpacity: 0.7 };

    const fname = getFeatureName(feature);
    const d = findDistrictData(fname);
    const hps = d?.hps_score ?? 0;
    return {
      fillColor: getColor(hps),
      weight: 1,
      opacity: 1,
      color: "#2b2b2b",
      fillOpacity: 0.7,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const name = getFeatureName(feature) ?? "Unknown";
    const d = findDistrictData(name);
    const hps = d?.hps_score ?? 0;
    const officers = d?.officer_count ?? "—";

    layer.bindPopup(`<strong>${name}</strong><br/>HPS: ${hps}<br/>Officers: ${officers}`);

    layer.on({
      click: () => onDistrictClick?.(d?.district_name ?? name),
      mouseover: (e: any) => e.target.setStyle({ weight: 2, color: "#000", fillOpacity: 0.9 }),
      mouseout: (e: any) => e.target.setStyle(styleFeature(feature)),
    });
  };

  const center: [number, number] = [20.2961, 85.8245]; // Odisha approximate center

  return (
    <div className="w-full h-[520px] rounded-lg overflow-hidden shadow">
      {geoJson ? (
        <MapContainer center={center} zoom={7} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <GeoJSON data={geoJson} style={styleFeature} onEachFeature={onEachFeature} />
        </MapContainer>
      ) : (
        <div className="flex items-center justify-center h-full">Loading map...</div>
      )}
    </div>
  );
}
