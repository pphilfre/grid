import {
  Activity,
  ArrowUpRight,
  Database,
  Globe2,
  MapPin,
  Radar,
  Server,
  Shield,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const metrics = [
  {
    label: "Active feeds",
    value: "128",
    detail: "+12% last 24h",
  },
  {
    label: "Geo matches",
    value: "2,914",
    detail: "97% confidence",
  },
  {
    label: "Infra entities",
    value: "48,320",
    detail: "12 regions",
  },
  {
    label: "Alert queue",
    value: "36",
    detail: "8 critical",
  },
];

const signals = [
  {
    title: "Maritime relay discovered",
    meta: "South China Sea · 08:13 UTC",
    status: "High",
  },
  {
    title: "Satellite uplink handshake",
    meta: "Caspian Corridor · 08:04 UTC",
    status: "Medium",
  },
  {
    title: "Power grid anomaly",
    meta: "Northern Europe · 07:52 UTC",
    status: "Low",
  },
];

const infraEntities = [
  {
    name: "AS14593",
    meta: "Tier-1 transit · 118 nodes",
  },
  {
    name: "Edge cluster-09",
    meta: "S3 mirror · 32 buckets",
  },
  {
    name: "Domain mesh",
    meta: "218 apex domains",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border/60 bg-surface/80 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-sm font-semibold text-primary">
            G
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-[0.18em] text-muted">
              GRID INTELLIGENCE
            </span>
            <span className="text-xs text-muted">
              GEOINT · OSINT · Signals Fusion
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success">LIVE</Badge>
          <Button variant="outline" size="sm">
            Mission Logs
          </Button>
          <Button size="sm">
            New Mission
            <ArrowUpRight className="h-4 w-4" />
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-80 flex-col gap-6 border-r border-border/60 bg-surface/60 px-5 py-6">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.32em] text-muted">
              OSINT Sidebar
            </p>
            <input
              placeholder="Search entities, IPs, domains"
              className="w-full rounded-md border border-border/60 bg-surface-elevated/70 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <Card className="bg-surface-elevated/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Radar className="h-4 w-4 text-accent" />
                Active Mission
              </CardTitle>
              <CardDescription>
                Operation Nightwatch · 12 active sensors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Coverage</span>
                <span className="font-mono text-xs">82.4% perimeter</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Latency</span>
                <span className="font-mono text-xs">142ms avg</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Integrity</span>
                <span className="font-mono text-xs">99.2%</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.32em] text-muted">
              Infra Entities
            </p>
            <div className="space-y-2">
              {infraEntities.map((entity) => (
                <div
                  key={entity.name}
                  className="rounded-lg border border-border/60 bg-surface-elevated/60 px-3 py-2"
                >
                  <p className="text-sm font-medium text-foreground">
                    {entity.name}
                  </p>
                  <p className="text-xs text-muted">{entity.meta}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="bg-surface-elevated/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-primary" />
                Provenance
              </CardTitle>
              <CardDescription>Last audit · 06:02 UTC</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Signed sources</span>
                <span className="font-mono text-xs">1,932</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Deterministic links</span>
                <span className="font-mono text-xs">98.7%</span>
              </div>
            </CardContent>
          </Card>
        </aside>

        <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
          <section className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-muted">
                Command Center
              </p>
              <h1 className="text-2xl font-semibold">Tactical Overview</h1>
              <p className="text-sm text-muted">
                Multi-source fusion for rapid geospatial decisions.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="primary">VERCEL GRADE</Badge>
              <Badge variant="accent">PALANTIR DENSITY</Badge>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <Card key={metric.label} className="bg-surface-elevated/70">
                <CardHeader className="space-y-2">
                  <CardDescription>{metric.label}</CardDescription>
                  <CardTitle className="text-2xl font-semibold">
                    {metric.value}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted">{metric.detail}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[2.2fr_1fr]">
            <Card className="relative overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" />
                  Tactical Map
                </CardTitle>
                <CardDescription>
                  Mapbox vector layers · 214k active tiles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative h-[360px] w-full overflow-hidden rounded-lg border border-border/60 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_55%),linear-gradient(120deg,_rgba(79,70,229,0.18),_transparent_60%),linear-gradient(to_bottom,_rgba(15,23,42,0.35),_rgba(15,23,42,0.05))]">
                  <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(148,163,184,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.2)_1px,transparent_1px)] [background-size:32px_32px]" />
                  <div className="relative z-10 flex h-full flex-col justify-between p-6">
                    <div className="flex items-center gap-3">
                      <Badge variant="success">GEOLOCK</Badge>
                      <span className="text-xs text-muted">
                        12 live regions tracked
                      </span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-muted">Primary node</p>
                        <p className="font-mono text-sm">37.7739° N · 122.4312° W</p>
                      </div>
                      <Button size="sm" variant="secondary">
                        Open Map
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              <Card className="bg-surface-elevated/70">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Globe2 className="h-4 w-4 text-primary" />
                    Regional Coverage
                  </CardTitle>
                  <CardDescription>Cluster integrity by zone</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted">EMEA</span>
                      <span className="font-mono">96%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-border/60">
                      <div className="h-1.5 w-[96%] rounded-full bg-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted">APAC</span>
                      <span className="font-mono">88%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-border/60">
                      <div className="h-1.5 w-[88%] rounded-full bg-accent" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted">AMER</span>
                      <span className="font-mono">92%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-border/60">
                      <div className="h-1.5 w-[92%] rounded-full bg-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-surface-elevated/70">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Database className="h-4 w-4 text-accent" />
                    Ingestion Pipeline
                  </CardTitle>
                  <CardDescription>EXIF → GEOHASH → ENTITY LINK</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Queued images</span>
                    <span className="font-mono text-xs">412</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Processing</span>
                    <span className="font-mono text-xs">21 jobs</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Mean latency</span>
                    <span className="font-mono text-xs">2.4s</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Card className="bg-surface-elevated/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4 text-success" />
                  Recent Signals
                </CardTitle>
                <CardDescription>Automated alert triage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {signals.map((signal, index) => (
                  <div key={signal.title} className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {signal.title}
                        </p>
                        <p className="text-xs text-muted">{signal.meta}</p>
                      </div>
                      <Badge
                        variant={
                          signal.status === "High"
                            ? "danger"
                            : signal.status === "Medium"
                              ? "warning"
                              : "default"
                        }
                      >
                        {signal.status}
                      </Badge>
                    </div>
                    {index < signals.length - 1 ? <Separator /> : null}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-surface-elevated/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Server className="h-4 w-4 text-warning" />
                  Edge Operations
                </CardTitle>
                <CardDescription>Realtime node telemetry</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted">Primary ingress</p>
                  <p className="font-mono text-sm">edge-usw2-09 · 42ms</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted">Secondary ingress</p>
                  <p className="font-mono text-sm">edge-emea-02 · 51ms</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted">Cache hit ratio</p>
                  <p className="font-mono text-sm">94.1%</p>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}
