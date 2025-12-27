"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  BookOpen,
  LineChart,
  PlugZap,
  ShieldCheck,
  Zap,
} from "lucide-react";
import ApiHero from "@/app/components/ApiHero";
import FeatureCard from "@/app/components/FeatureCard";
import Navbar from "@/app/components/Navbar";
import Sidebar from "@/app/components/Sidebar";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";

const features = [
  {
    title: "Fast & Reliable",
    description: "Optimized latency pipeline with streaming response.",
    icon: Zap,
  },
  {
    title: "Secure",
    description: "Server-side API key management with access controls.",
    icon: ShieldCheck,
  },
  {
    title: "Easy Integration",
    description: "Simple internal endpoints for app teams.",
    icon: PlugZap,
  },
  {
    title: "Analytics",
    description: "Monitor usage, latency, and error rates.",
    icon: LineChart,
  },
];

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-72">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-16 pt-8">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ApiHero totalEndpoints={50} categories={8} />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="border-border/60 bg-card/80 shadow-sm">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4 text-primary" />
                  API Documentation
                </div>
                <p className="text-xl font-semibold text-foreground">
                  Semua endpoint internal tersedia dalam satu panel dokumentasi.
                </p>
                <p className="text-sm text-muted-foreground">
                  Gunakan halaman docs untuk melihat detail request, contoh
                  payload, dan melakukan testing langsung tanpa Postman.
                </p>
                <Button asChild className="w-fit">
                  <Link href="/docs">Go to Docs -&gt;</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/80 shadow-sm">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4 text-primary" />
                  API Overview
                </div>
                <p className="text-lg font-semibold text-foreground">
                  Status layanan siap dipakai untuk testing internal.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Health</span>
                    <span className="font-semibold text-foreground">Ready</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Latency target</span>
                    <span className="font-semibold text-foreground">200ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Streaming</span>
                    <span className="font-semibold text-foreground">On</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">
                Key Features
              </h2>
              <Button type="button" variant="outline" size="sm">
                Explore roadmap
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
