"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import { CATEGORIES, type Place } from "@/data/places";
import { ICC, type LatLng } from "@/lib/geo";

const REGIONS = {
  jeju: { center: [33.37, 126.55], zoom: 10, minZoom: 9, bounds: [[32.9, 125.9], [33.8, 127.2]] },
  korea: { center: [35.9, 127.6], zoom: 7, minZoom: 6, bounds: [[32.5, 123.5], [39.0, 132.0]] },
} as const;

const iccIcon = L.divIcon({
  className: "",
  html: '<div style="background:#ea580c;color:#fff;font:600 11px/1 system-ui;padding:6px 8px;border-radius:999px;box-shadow:0 1px 4px #0006;white-space:nowrap">ICC Jeju</div>',
  iconSize: [64, 24],
  iconAnchor: [32, 12],
});

const meIcon = L.divIcon({
  className: "",
  html: '<div style="width:16px;height:16px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 6px #2563eb33"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function Camera({ selected, route }: { selected?: Place; route: LatLng[] }) {
  const map = useMap();

  useEffect(() => {
    if (route.length > 1) {
      map.flyToBounds(L.latLngBounds(route.map((p) => [p.lat, p.lng])), {
        padding: [40, 40],
        duration: 0.6,
      });
    }
  }, [map, route]);

  useEffect(() => {
    if (selected) {
      map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 13), { duration: 0.6 });
    }
  }, [map, selected]);

  // The container changes size between layouts (phone portrait/landscape, tablet split).
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);

  return null;
}

type Props = {
  places: Place[];
  selectedId?: string;
  onSelect: (id: string) => void;
  route: LatLng[];
  me?: LatLng;
  region?: keyof typeof REGIONS;
};

export default function MapView({ places, selectedId, onSelect, route, me, region = "jeju" }: Props) {
  const selected = places.find((p) => p.id === selectedId);
  const r = REGIONS[region];

  return (
    <MapContainer
      center={[...r.center]}
      zoom={r.zoom}
      minZoom={r.minZoom}
      maxBounds={r.bounds.map((b) => [...b] as [number, number])}
      className="size-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Camera selected={selected} route={route} />

      {route.length > 1 && (
        <Polyline
          positions={route.map((p) => [p.lat, p.lng])}
          pathOptions={{ color: "#ea580c", weight: 4, dashArray: "8 8" }}
        />
      )}

      {places.map((p) => {
        const active = p.id === selectedId;
        return (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={active ? 11 : 8}
            pathOptions={{
              color: "#fff",
              weight: active ? 3 : 2,
              fillColor: CATEGORIES[p.category].color,
              fillOpacity: 0.95,
            }}
            eventHandlers={{ click: () => onSelect(p.id) }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              {p.name}
            </Tooltip>
          </CircleMarker>
        );
      })}

      <Marker position={[ICC.lat, ICC.lng]} icon={iccIcon} zIndexOffset={1000} />
      {me && <Marker position={[me.lat, me.lng]} icon={meIcon} />}
    </MapContainer>
  );
}
