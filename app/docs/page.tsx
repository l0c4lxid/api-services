"use client";

import { useMemo, useState } from "react";
import { BookOpen, FileJson, Terminal } from "lucide-react";
import EndpointCard from "@/app/components/EndpointCard";
import Navbar from "@/app/components/Navbar";
import Sidebar from "@/app/components/Sidebar";
import { Badge } from "@/app/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { Card, CardContent } from "@/app/components/ui/card";
import { apiList } from "@/app/lib/apiList";

export default function DocsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const groupedEndpoints = useMemo(() => {
    return apiList.reduce<Record<string, typeof apiList>>((acc, endpoint) => {
      if (!acc[endpoint.category]) {
        acc[endpoint.category] = [];
      }
      acc[endpoint.category].push(endpoint);
      return acc;
    }, {});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-72">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 pb-16 pt-8">
          <section className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary">v1.0</Badge>
              <Badge variant="outline">API Documentation</Badge>
            </div>
            <h1 className="text-3xl font-semibold text-foreground">
              LXID API Documentation
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Dokumentasi internal dan testing endpoint LXID. Semua request
              dikirim langsung ke route handler Next.js untuk debugging cepat.
            </p>
          </section>

          <section className="grid gap-4 md:grid-cols-[1.4fr_0.6fr]">
            <Card className="border-border/60 bg-card/80 shadow-sm">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4 text-primary" />
                  API Intro
                </div>
                <p className="text-base text-foreground">
                  API ini digunakan untuk mengirim prompt ke LXID melalui
                  endpoint internal Next.js. Fokus halaman ini adalah
                  testing request, melihat response, dan debugging cepat.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/80 shadow-sm">
              <CardContent className="space-y-2 p-5 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Usage Notes</p>
                <p>Endpoint ini siap dipakai untuk testing internal.</p>
                <p>Gunakan panel di bawah untuk melihat request &amp; response.</p>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Terminal className="h-4 w-4 text-primary" />
              Endpoint List
            </div>
            <div className="space-y-6">
              {Object.entries(groupedEndpoints).map(([category, endpoints]) => (
                <Card
                  key={category}
                  className="border-border/60 bg-card/80 shadow-sm"
                >
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold text-foreground">
                        {category}
                      </p>
                      <Badge variant="secondary">
                        {endpoints.length} endpoints
                      </Badge>
                    </div>
                    <Accordion type="multiple" className="space-y-3">
                      {endpoints.map((endpoint) => (
                        <AccordionItem
                          key={endpoint.id}
                          value={endpoint.id}
                          className="rounded-2xl border border-border/60 px-4"
                        >
                          <AccordionTrigger className="text-sm">
                            <span className="flex flex-wrap items-center gap-3">
                              <Badge variant="outline">{endpoint.method}</Badge>
                              <span className="font-mono text-xs text-foreground">
                                {endpoint.path}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {endpoint.name}
                              </span>
                            </span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <EndpointCard endpoint={endpoint} />
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <Card className="border-border/60 bg-card/80 shadow-sm">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileJson className="h-4 w-4 text-primary" />
                  Response Format
                </div>
                <p className="text-sm text-muted-foreground">
                  Response ditampilkan dalam format raw text atau JSON yang sudah
                  dipretty-print. Status code dan response time tercatat untuk
                  mempermudah debug.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/80 shadow-sm">
              <CardContent className="space-y-2 p-5">
                <p className="text-sm font-semibold text-foreground">
                  HTTP Status Codes
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <span>200 OK</span>
                  <span>400 Bad Request</span>
                  <span>401 Unauthorized</span>
                  <span>429 Too Many Requests</span>
                  <span>500 Internal Server Error</span>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}
