"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Mail, MessageCircle, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Docs", href: "/docs", icon: BookOpen },
  { label: "Contact", href: "/contact", icon: Mail },
  { label: "Channel", href: "/channel", icon: MessageCircle },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const NavContent = () => (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            onClick={onClose}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="fixed left-0 top-0 hidden h-full w-72 flex-col gap-6 border-r border-border/60 bg-sidebar px-6 py-8 text-sidebar-foreground lg:flex">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Navigation
          </p>
          <p className="text-lg font-semibold text-foreground">LXID Console</p>
        </div>
        <NavContent />
        <div className="mt-auto rounded-2xl border border-border/60 bg-card/70 p-4 text-xs text-muted-foreground">
          Butuh bantuan? Kontak tim backend untuk akses dan batas kuota.
        </div>
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      >
        <aside
          className={cn(
            "absolute left-0 top-0 flex h-full w-72 flex-col gap-6 border-r border-border/60 bg-sidebar px-6 py-8 text-sidebar-foreground shadow-2xl transition",
            open ? "translate-x-0" : "-translate-x-full",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Navigation
              </p>
              <p className="text-lg font-semibold text-foreground">
                LXID Console
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <NavContent />
          <div className="mt-auto rounded-2xl border border-border/60 bg-card/70 p-4 text-xs text-muted-foreground">
            Kontak: api-team@company.dev
          </div>
        </aside>
      </div>
    </>
  );
}
