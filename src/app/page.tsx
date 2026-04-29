"use client";

import type { Map as MapboxMap, Marker as MapboxMarker } from "mapbox-gl";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Compass,
  Loader2,
  Map as MapIcon,
  Radar,
  Radio,
  Settings,
  Shield,
  Upload,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
    id: "standard",
    label: "Dusk",
    logo: "DK",
    uri: "mapbox://styles/mapbox/standard",
    logoClass: "from-slate-900 via-slate-700 to-slate-500",
    buildingColor: "#111827",
    buildingOpacity: 0.78,
    config: {
      lightPreset: "dusk",
      showPointOfInterestLabels: false,
    },
  },
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

type MapboxGLInstance = typeof import("mapbox-gl")["default"];

export default function NeumorphicMapDashboard() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("map");
  const [pulses, setPulses] = useState(LIVE_FEED_DATA);
  const [styleId, setStyleId] = useState("standard");
  const [is3d, setIs3d] = useState(true);
  const [viewMode, setViewMode] = useState<"2d" | "3d" | "blue">("3d");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<Map<number, MapboxMarker>>(new Map());
  const mapboxglRef = useRef<MapboxGLInstance | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const styleIdRef = useRef(styleId);
  const is3dRef = useRef(is3d);

  const getStyleConfig = useCallback(
    () => MAP_STYLES.find(style => style.id === styleIdRef.current) ?? MAP_STYLES[0],
    []
  );

  const apply3dStyle = useCallback(
    (map: MapboxMap) => {
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
    if (viewMode === "2d") {
      setIs3d(false);
      setStyleId("dark");
      return;
    }

    if (viewMode === "3d") {
      setIs3d(true);
      setStyleId("standard");
      return;
    }

    setIs3d(false);
    setStyleId("out");
  }, [viewMode]);

  useEffect(() => {
    return () => {
      if (uploadTimerRef.current) {
        clearTimeout(uploadTimerRef.current);
      }
    };
  }, []);

  const focusSignalDrift = useCallback(() => {
    if (!mapRef.current) {
      return;
    }

    const target = pulses.find(pulse => pulse.title === "Signal Drift") ?? LIVE_FEED_DATA[0];
    if (!target) {
      return;
    }

    mapRef.current.flyTo({
      center: [target.position.lng, target.position.lat],
      zoom: 7,
      speed: 0.9,
      curve: 1.4,
      essential: true,
    });

    const marker = markersRef.current.get(target.id);
    marker?.togglePopup();
  }, [pulses]);

  const startUpload = useCallback(() => {
    if (uploading) {
      return;
    }

    setUploading(true);
    if (uploadTimerRef.current) {
      clearTimeout(uploadTimerRef.current);
    }

    uploadTimerRef.current = setTimeout(() => {
      setUploading(false);
      setUploadOpen(false);
      focusSignalDrift();
    }, 1600);
  }, [focusSignalDrift, uploading]);

  const handleUploadFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) {
        return;
      }
      startUpload();
    },
    [startUpload]
  );

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) {
      return;
    }

    const mapboxgl = (window as typeof window & { mapboxgl?: MapboxGLInstance }).mapboxgl;
    if (!mapboxgl) {
      setMapError("Mapbox GL JS failed to load.");
      return;
    }
    mapboxglRef.current = mapboxgl;

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
      style: MAP_STYLES.find(style => style.id === styleIdRef.current)?.uri,
      center: [6.0, 28.0],
      zoom: 1.6,
      pitch: is3dRef.current ? 35 : 0,
      bearing: is3dRef.current ? -10 : 0,
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

      const labelLayerId = mapStyle.layers?.find(
        layer => layer.type === "symbol" && "text-field" in (layer.layout ?? {})
      )?.id;
      const beforeId = labelLayerId ?? mapStyle.layers?.find(layer => layer.id === "waterway-label")?.id;

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
        beforeId
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
      const styleConfig = getStyleConfig().config;
      if (styleConfig?.lightPreset) {
        map.setConfigProperty("basemap", "lightPreset", styleConfig.lightPreset);
      }
      if (typeof styleConfig?.showPointOfInterestLabels === "boolean") {
        map.setConfigProperty("basemap", "showPointOfInterestLabels", styleConfig.showPointOfInterestLabels);
      }
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
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
      mapboxglRef.current = null;
      setMapReady(false);
    };
  }, [apply3dStyle, getStyleConfig]);

  useEffect(() => {
    if (!mapRef.current || !mapReady) {
      return;
    }

    const mapboxgl = mapboxglRef.current;
    if (!mapboxgl) {
      return;
    }

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();
    pulses.forEach(pulse => {
      const element = document.createElement("div");
      element.dataset.pulseId = String(pulse.id);
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

      markersRef.current.set(pulse.id, marker);
    });
  }, [mapReady, pulses]);

  useEffect(() => {
    if (!mapRef.current || !mapReady) {
      return;
    }

    const style = MAP_STYLES.find(item => item.id === styleId)?.uri;
    if (style) {
      mapRef.current.setStyle(style, {
        diff: false,
        localFontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif",
        localIdeographFontFamily: "Noto Sans, ui-sans-serif, system-ui, sans-serif",
      });
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
    <div className="flex h-screen w-full bg-black text-white font-sans overflow-hidden">
      <aside
        className={cn(
          "relative z-20 flex flex-col justify-between px-3 py-5 border-r border-white/10 bg-black transition-all duration-300",
          sidebarExpanded ? "w-64" : "w-[66px]"
        )}
      >
        <div className="flex flex-1 flex-col gap-5">
          <div className="flex h-[66px] w-full items-center justify-between gap-2 border-b border-white/10 px-3">
            <div className="flex h-10 w-10 items-center justify-center border border-white/10 bg-black">
              <Radar className="h-5 w-5 text-white" />
            </div>
            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                sidebarExpanded ? "max-w-[180px] opacity-100" : "max-w-0 opacity-0"
              )}
            >
              <span className="text-sm uppercase tracking-[0.32em] text-white whitespace-nowrap">
                Grid
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <NavItem
              icon={<MapIcon className="h-5 w-5" />}
              label="Tactical Map"
              active={activeTab === "map"}
              expanded={sidebarExpanded}
              onClick={() => setActiveTab("map")}
            />
            <NavItem
              icon={<Activity className="h-5 w-5" />}
              label="Pulse Feed"
              active={activeTab === "analytics"}
              expanded={sidebarExpanded}
              onClick={() => setActiveTab("analytics")}
            />
            <NavItem
              icon={<Users className="h-5 w-5" />}
              label="Operators"
              active={activeTab === "operators"}
              expanded={sidebarExpanded}
              onClick={() => setActiveTab("operators")}
            />
            <NavItem
              icon={<Compass className="h-5 w-5" />}
              label="Geo Intel"
              expanded={sidebarExpanded}
            />
            <NavItem
              icon={<Shield className="h-5 w-5" />}
              label="Security"
              expanded={sidebarExpanded}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Separator className="bg-white/10" />
          <NavItem icon={<Settings className="h-5 w-5" />} label="Settings" expanded={sidebarExpanded} />
          <Button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            variant="secondary"
            size="icon"
            className="mx-auto rounded-none border border-white/10 bg-black text-white hover:bg-white/10"
            aria-label="Toggle sidebar"
          >
            {sidebarExpanded ? <ChevronLeft className="h-4.5 w-4.5" /> : <ChevronRight className="h-4.5 w-4.5" />}
          </Button>
        </div>
      </aside>

      <main className="flex-1 relative overflow-hidden isolate">
        <div ref={mapContainerRef} className="absolute inset-0 h-full w-full z-0" />
        <div className="absolute inset-0 z-10 noise-layer opacity-10 pointer-events-none" />

        {mapError && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 text-xs text-slate-300">
            <div className="rounded-2xl border border-[#1f2429] bg-[#0f1317]/90 px-6 py-4 font-mono">
              {mapError}
            </div>
          </div>
        )}

        <div className="absolute inset-0 z-[100] pointer-events-none">
          <div className="absolute left-6 top-6 flex flex-col items-start gap-3 pointer-events-auto">
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-none border border-white/15 bg-black text-white hover:bg-white/10"
                onClick={() => setUploadOpen(value => !value)}
                aria-label="Upload signal image"
              >
                <Upload className="h-4.5 w-4.5" />
              </Button>
              <div className="flex items-center gap-2 border border-white/15 bg-black px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-white">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                Live
              </div>
            </div>

            {uploadOpen && (
              <Card className="w-80 bg-black border-white/10 rounded-none shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white">Upload signal image</CardTitle>
                  <p className="text-xs text-white/60">Drop a frame or select a file to analyze.</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div
                    onDragOver={event => {
                      event.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={event => {
                      event.preventDefault();
                      setDragActive(false);
                      handleUploadFiles(event.dataTransfer.files);
                    }}
                    className={cn(
                      "flex min-h-[110px] flex-col items-center justify-center gap-3 border border-dashed px-4 py-4 text-center text-xs transition",
                      dragActive
                        ? "border-white/50 bg-white/5"
                        : "border-white/15 bg-black"
                    )}
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2 text-white/60">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Analyzing image stream...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-white/60">
                        <span>Drag an image here</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-none border-white/20 bg-black text-white hover:bg-white/10"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Click to upload
                        </Button>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={event => handleUploadFiles(event.target.files)}
                  />
                </CardContent>
              </Card>
            )}

            <div className="flex items-center gap-2 text-xs font-mono text-white/50">
              <span>NODE_9X / RELAY_03</span>
            </div>
          </div>

          <div className="absolute right-6 top-6 flex flex-col items-end gap-3 pointer-events-auto">
            <div className="border border-white/15 bg-black px-3 py-2 text-[10px] uppercase tracking-[0.32em] text-white/60">
              Active signals {pulses.length}
            </div>

            <div className="flex items-center gap-2 border border-white/15 bg-black px-3 py-2">
              <span className="text-[10px] uppercase tracking-[0.28em] text-white/50">View</span>
              <div className="flex items-center gap-1 border border-white/10 bg-black p-1">
                {[
                  { id: "2d", label: "2D" },
                  { id: "3d", label: "3D" },
                  { id: "blue", label: "Blue" },
                ].map(mode => (
                  <Button
                    key={mode.id}
                    variant={viewMode === mode.id ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-7 rounded-none px-3 text-[10px] uppercase tracking-[0.24em]",
                      viewMode === mode.id
                        ? "bg-white text-black hover:bg-white"
                        : "text-white/70 hover:bg-white/10"
                    )}
                    onClick={() => setViewMode(mode.id as "2d" | "3d" | "blue")}
                  >
                    {mode.label}
                  </Button>
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
    <Button
      onClick={onClick}
      variant={active ? "secondary" : "ghost"}
      className={cn(
        "group relative h-10 w-full items-center rounded-none px-2 text-white/70",
        expanded ? "justify-start gap-3" : "justify-center gap-0",
        active ? "bg-white text-black hover:bg-white" : "hover:bg-white/10 hover:text-white"
      )}
    >
      <span className="flex h-5 w-5 items-center justify-center">{icon}</span>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out flex items-center whitespace-nowrap",
          expanded ? "max-w-[200px] opacity-100 translate-x-1" : "max-w-0 opacity-0 -translate-x-3"
        )}
      >
        <span className={cn(
          "text-xs font-semibold tracking-[0.22em] uppercase",
          active ? "text-black" : "text-white/60"
        )}>
          {label}
        </span>
      </div>
    </Button>
  );
}
