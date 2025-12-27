"use client";

import Link from "next/link";
import { Menu, Sparkles } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";

type NavbarProps = {
  onMenuClick: () => void;
};

export default function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Gemini API Console
              </p>
              <p className="text-xs text-muted-foreground">
                Custom API documentation
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="hidden sm:inline-flex" variant="secondary">
            v1.0
          </Badge>
          <Button asChild>
            <Link href="/docs">Open Docs</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
