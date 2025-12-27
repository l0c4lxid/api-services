import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";

type StatCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
};

export default function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <Card className="border-border/60 bg-card/80 shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-xl bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </p>
          <p className="text-lg font-semibold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
