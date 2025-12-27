import Link from "next/link";
import { ArrowRight, Layers, Network, Server } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import StatCard from "@/app/components/StatCard";

type ApiHeroProps = {
  totalEndpoints: number;
  categories: number;
};

export default function ApiHero({ totalEndpoints, categories }: ApiHeroProps) {
  return (
    <Card className="overflow-hidden border-border/60 bg-card/80 shadow-xl">
      <CardContent className="grid gap-8 p-6 md:grid-cols-[1.1fr_0.9fr] md:p-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <Badge variant="secondary" className="w-fit">
              Internal API Platform
            </Badge>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Gemini API
              </h1>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">
                Internal API for testing Google Gemini, lengkap dengan custom
                documentation dan testing console.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard
              label="Total Endpoints"
              value={String(totalEndpoints)}
              icon={Server}
            />
            <StatCard
              label="Categories"
              value={String(categories)}
              icon={Layers}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href="/docs">
                Go to Docs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button type="button" variant="outline">
              <Network className="h-4 w-4" />
              Monitor status
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-12 left-10 h-40 w-40 rounded-full bg-emerald-200/50 blur-3xl dark:bg-emerald-400/20" />
          <div className="relative aspect-[4/3] w-full rounded-2xl border border-border/60 bg-gradient-to-br from-sky-100 via-emerald-50 to-white shadow-2xl dark:from-slate-900 dark:via-slate-800 dark:to-slate-950">
            <div className="absolute inset-0 rounded-2xl border border-white/40" />
            <div className="flex h-full w-full flex-col justify-between p-5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>api.gemini.internal</span>
                <span>Live metrics</span>
              </div>
              <div className="space-y-2 rounded-xl bg-white/70 p-4 text-xs text-slate-700 shadow-sm backdrop-blur dark:bg-slate-900/70 dark:text-slate-200">
                <p className="text-sm font-semibold">Latency</p>
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                  <div className="h-2 w-3/4 rounded-full bg-primary" />
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <span>p95</span>
                  <span>180ms</span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 right-6 rounded-xl border border-border/60 bg-background/80 px-4 py-2 text-xs text-muted-foreground shadow-lg">
            Banner preview
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
