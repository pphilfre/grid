"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Compass,
  Map as MapIcon,
  Radar,
  Radio,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LIVE_FEED_DATA = [
  {
    id: 1,
    type: "alert",
    title: "Signal Drift",
    location: "Sector 4",
    time: "Just now",
    position: { lng: -0.206, lat: 51.801 }
  },
  {
    id: 2,
    type: "update",
    title: "Unit Deployed",
    location: "Docklands",
    time: "2m ago",
    position: { lng: -0.11, lat: 51.507 },
  },
  {
    id: 3,
    type: "info",
    title: "Traffic Normal",
    location: "West Bridge",
    time: "5m ago",
    position: { lng: -74.006, lat: 40.7128 },
  },
  {
    id: 4,
    type: "alert",
    title: "High Volume",
    location: "Terminal A",
    time: "12m ago",
    position: { lng: 139.6917, lat: 35.6895 },
  },
];

const MAP_STYLES = [
  {
    id: "dark",
    label: "Noir",
    logo: "NX",
    uri: "mapbox://styles/mapbox/dark-v11",
    logoClass: "from-slate-900 via-slate-800 to-slate-600",
    buildingColor: "#101418",
    buildingOpacity: 0.75,
  },
  {
    id: "sat",
    label: "Orbit",
    logo: "OR",
    uri: "mapbox://styles/mapbox/satellite-streets-v12",
    logoClass: "from-emerald-700 via-emerald-500 to-emerald-300",
    buildingColor: "#d1d5db",
    buildingOpacity: 0.85,
  },
  {
    id: "out",
    label: "Grid",
    logo: "GR",
    uri: "mapbox://styles/mapbox/navigation-night-v1",
    logoClass: "from-sky-700 via-sky-500 to-sky-300",
    buildingColor: "#0b1016",
    buildingOpacity: 0.75,
  },
];

export default function NeumorphicMapDashboard() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("map");
  const [pulses, setPulses] = useState(LIVE_FEED_DATA);
  const [styleId, setStyleId] = useState("dark");
  const [is3d, setIs3d] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const styleIdRef = useRef(styleId);
  const is3dRef = useRef(is3d);

  const getStyleConfig = useCallback(
    () => MAP_STYLES.find(style => style.id === styleIdRef.current) ?? MAP_STYLES[0],
    []
  );

  const apply3dStyle = useCallback(
    (map: mapboxgl.Map) => {
      const { buildingColor, buildingOpacity } = getStyleConfig();
      if (!map.getLayer("3d-buildings")) {
        return;
      }

      map.setPaintProperty("3d-buildings", "fill-extrusion-color", buildingColor);
      map.setPaintProperty("3d-buildings", "fill-extrusion-opacity", buildingOpacity);
      map.setPaintProperty("3d-buildings", "fill-extrusion-color-transition", {
        duration: 700,
        delay: 0,
      });
      map.setPaintProperty("3d-buildings", "fill-extrusion-opacity-transition", {
        duration: 700,
        delay: 0,
      });
    },
    [getStyleConfig]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setPulses(current => {
        const newPulse = {
          id: Date.now(),
          type: Math.random() > 0.7 ? "alert" : "info",
          title: Math.random() > 0.7 ? "Signal Anomaly" : "Signal Received",
          location: `Sector ${Math.floor(Math.random() * 9) + 1}`,
          time: "Just now",
          position: {
            lng: (Math.random() * 320 - 160).toFixed(3),
            lat: (Math.random() * 120 - 60).toFixed(3),
          },
        };
        return [
          {
            ...newPulse,
            position: {
              lng: Number(newPulse.position.lng),
              lat: Number(newPulse.position.lat),
            },
          },
          ...current,
        ].slice(0, 6);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    styleIdRef.current = styleId;
  }, [styleId]);

  useEffect(() => {
    is3dRef.current = is3d;
  }, [is3d]);

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) {
      return;
    }

    const token =
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN ??
      "pk.eyJ1IjoiZnJlZGRpZXBoaWxwb3QiLCJhIjoiY21vaXlydm9sMDdkdTJyczZ0dzM2bTVwdSJ9.kcsSQHik1Bxcy0bvZhWqKQ";
    if (!token) {
      setMapError("Missing NEXT_PUBLIC_MAPBOX_TOKEN");
      return;
    }

    if (!mapboxgl.supported()) {
      setMapError("Mapbox GL is not supported in this browser.");
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLES.find(style => style.id === styleId)?.uri,
      center: [6.0, 28.0],
      zoom: 1.6,
      pitch: is3d ? 35 : 0,
      bearing: is3d ? -10 : 0,
      projection: { name: "globe" },
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "bottom-right");
    const add3dBuildings = () => {
      const mapStyle = map.getStyle();
      if (!mapStyle?.sources?.composite) {
        return;
      }

      if (map.getLayer("3d-buildings")) {
        return;
      }

      map.addLayer(
        {
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 15,
          paint: {
            "fill-extrusion-color": getStyleConfig().buildingColor,
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": ["get", "min_height"],
            "fill-extrusion-opacity": getStyleConfig().buildingOpacity,
            "fill-extrusion-color-transition": {
              duration: 700,
              delay: 0,
            },
            "fill-extrusion-opacity-transition": {
              duration: 700,
              delay: 0,
            },
          },
          layout: {
            visibility: is3dRef.current ? "visible" : "none",
          },
        },
        "waterway-label"
      );
    };

    map.once("load", () => {
      map.setFog({
        color: "rgba(9, 11, 14, 0.9)",
        "high-color": "rgba(16, 20, 26, 0.95)",
        "space-color": "rgba(4, 6, 8, 1)",
        "star-intensity": 0.25,
      });
      add3dBuildings();
      map.resize();
      setMapReady(true);
      setMapError(null);
    });

    map.on("style.load", () => {
      add3dBuildings();
      apply3dStyle(map);
    });

    map.on("error", event => {
      const message = event?.error?.message ?? "Mapbox error";
      if (message.includes("Unable to perform style diff") || message.includes("setSprite")) {
        return;
      }
      setMapError(message);
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [apply3dStyle, getStyleConfig]);

  useEffect(() => {
    if (!mapRef.current || !mapReady) {
      return;
    }

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = pulses.map(pulse => {
      const element = document.createElement("div");
      element.className = "signal-marker";
      element.style.backgroundColor = pulse.type === "alert" ? "#22c55e" : "#60a5fa";
      element.style.boxShadow = pulse.type === "alert"
        ? "0 0 14px rgba(34, 197, 94, 0.6)"
        : "0 0 12px rgba(96, 165, 250, 0.5)";

      const marker = new mapboxgl.Marker({ element })
        .setLngLat([pulse.position.lng, pulse.position.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 16, closeButton: false }).setHTML(
            `<div class="px-2 py-1 text-xs font-semibold text-slate-100">${pulse.title}</div>`
          )
        )
        .addTo(mapRef.current!);

      return marker;
    });
  }, [mapReady, pulses]);

  useEffect(() => {
    if (!mapRef.current || !mapReady) {
      return;
    }

    const style = MAP_STYLES.find(item => item.id === styleId)?.uri;
    if (style) {
      mapRef.current.setStyle(style, { diff: false });
    }
    apply3dStyle(mapRef.current);
  }, [apply3dStyle, mapReady, styleId]);

  useEffect(() => {
    if (!mapRef.current || !mapReady) {
      return;
    }

    const visibility = is3d ? "visible" : "none";
    if (mapRef.current.getLayer("3d-buildings")) {
      mapRef.current.setLayoutProperty("3d-buildings", "visibility", visibility);
    }

    mapRef.current.easeTo({
      pitch: is3d ? 45 : 0,
      bearing: is3d ? -20 : 0,
      duration: 900,
    });
  }, [is3d, mapReady]);

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-slate-200 font-sans overflow-hidden">
      <aside
        className={cn(
          "relative z-20 flex flex-col justify-between py-5 bg-[#0d0f12] border-r border-[#15181c] transition-all duration-300",
          sidebarExpanded ? "w-60" : "w-[76px]"
        )}
      >
        <div className="flex flex-col gap-6 px-3">
          <div className="flex items-center gap-3 px-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#12161a] border border-[#1e2226] shadow-[0_0_0_1px_rgba(34,197,94,0.08)]">
              <Radar className="w-5 h-5 text-emerald-300" />
            </div>
            {sidebarExpanded && (
              <span className="text-xs font-semibold tracking-[0.4em] text-slate-200 uppercase">
                Aegis
              </span>
            )}
          </div>

          <nav className="flex flex-col gap-2">
            <NavItem
              icon={<MapIcon className="w-4.5 h-4.5" />}
              label="Tactical Map"
              active={activeTab === "map"}
              expanded={sidebarExpanded}
              onClick={() => setActiveTab("map")}
            />
            <NavItem
              icon={<Activity className="w-4.5 h-4.5" />}
              label="Pulse Feed"
              active={activeTab === "analytics"}
              expanded={sidebarExpanded}
              onClick={() => setActiveTab("analytics")}
            />
            <NavItem
              icon={<Users className="w-4.5 h-4.5" />}
              label="Operators"
              active={activeTab === "operators"}
              expanded={sidebarExpanded}
              onClick={() => setActiveTab("operators")}
            />
            <NavItem
              icon={<Compass className="w-4.5 h-4.5" />}
              label="Geo Intel"
              expanded={sidebarExpanded}
            />
            <NavItem
              icon={<Shield className="w-4.5 h-4.5" />}
              label="Security"
              expanded={sidebarExpanded}
            />
          </nav>
        </div>

        <div className="flex flex-col gap-3 px-3">
          <NavItem icon={<Settings className="w-4.5 h-4.5" />} label="Settings" expanded={sidebarExpanded} />
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="flex items-center justify-center h-10 w-10 mx-auto rounded-xl bg-[#0f1216] hover:bg-[#141a1f] text-slate-400 hover:text-slate-200 transition-all border border-[#1f2429]"
            aria-label="Toggle sidebar"
          >
            {sidebarExpanded ? <ChevronLeft className="w-4.5 h-4.5" /> : <ChevronRight className="w-4.5 h-4.5" />}
          </button>
        </div>
      </aside>

      <main className="flex-1 relative overflow-hidden isolate">
        <div ref={mapContainerRef} className="absolute inset-0 h-full w-full z-0" />
        <div className="absolute inset-0 z-10 noise-layer opacity-20 pointer-events-none" />

        {mapError && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 text-xs text-slate-300">
            <div className="rounded-2xl border border-[#1f2429] bg-[#0f1317]/90 px-6 py-4 font-mono">
              {mapError}
            </div>
          </div>
        )}

        <div className="absolute inset-0 z-[100] pointer-events-none">
          <div className="absolute left-6 top-6 flex items-center gap-3 pointer-events-auto">
            <div className="flex items-center gap-2 rounded-full border border-[#1c2126] bg-[#0f1317]/80 px-3 py-1 text-xs uppercase tracking-[0.3em] text-emerald-300">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              Live
            </div>
            <div className="text-xs font-mono text-slate-400">NODE_9X / RELAY_03</div>
          </div>
          <div className="absolute right-6 top-6 flex flex-col items-end gap-3 pointer-events-auto">
            <div className="flex items-center gap-2 rounded-full border border-[#1c2126] bg-[#0f1317]/80 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-slate-500">
              Active Signals {pulses.length}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-[#1f2429] bg-[#0f1317]/80 px-3 py-2 text-[10px] uppercase tracking-[0.3em]">
                <span className="text-slate-500">Mode</span>
                <button
                  onClick={() => setIs3d(value => !value)}
                  className={cn(
                    "rounded-full border px-3 py-1 transition",
                    is3d
                      ? "border-emerald-400/60 text-emerald-200"
                      : "border-[#1f2429] text-slate-500 hover:text-slate-200"
                  )}
                  aria-pressed={is3d}
                >
                  3D
                </button>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-[#1f2429] bg-[#0f1317]/80 px-3 py-2">
                {MAP_STYLES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => setStyleId(style.id)}
                    className={cn(
                      "group relative flex items-center justify-center",
                      styleId === style.id ? "" : "opacity-70"
                    )}
                    title={style.label}
                    aria-label={`${style.label} style`}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-[9px] font-semibold tracking-[0.2em] text-white shadow-[0_0_0_1px_rgba(15,18,22,0.6)] transition",
                        "bg-gradient-to-br",
                        style.logoClass,
                        styleId === style.id
                          ? "ring-2 ring-emerald-300/70"
                          : "ring-1 ring-transparent group-hover:ring-emerald-300/40"
                      )}
                    >
                      {style.logo}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, expanded, onClick }: { icon: React.ReactNode; label: string; active?: boolean; expanded: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative flex items-center justify-start h-10 px-2 rounded-xl transition-all duration-200 outline-none hover:text-slate-100 text-slate-400 select-none overflow-hidden"
    >
      <div className={cn(
        "absolute inset-0 rounded-xl transition-all duration-300 border",
        active
          ? "bg-[#11161b] border-[#1f2429] opacity-100"
          : "bg-[#0e1115] border-transparent opacity-0 group-hover:opacity-100"
      )} />

      <div className={cn("relative z-10 flex items-center h-full w-full", active ? "text-slate-100" : "")}>
        <div className="flex items-center justify-center h-8 w-8 rounded-lg border border-transparent group-hover:border-[#1f2429] bg-[#0a0c0f] text-slate-300">
          {icon}
        </div>

        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out flex items-center whitespace-nowrap",
            expanded ? "max-w-[200px] opacity-100 translate-x-3" : "max-w-0 opacity-0 -translate-x-4"
          )}
        >
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-slate-300">
            {label}
          </span>
        </div>
      </div>

      {active && (
        <div className="absolute left-[6px] top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(34,197,94,0.6)]" />
      )}
    </button>
  );
}
