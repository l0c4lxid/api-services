import { CheckCircle2, Info } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import ApiTester from "@/app/components/ApiTester";
import type { ApiEndpoint } from "@/app/lib/apiList";
import { cn } from "@/lib/utils";

type EndpointCardProps = {
  endpoint: ApiEndpoint;
};

const methodStyles: Record<ApiEndpoint["method"], string> = {
  GET: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  POST: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200",
  PUT: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
  DELETE: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200",
};

export default function EndpointCard({ endpoint }: EndpointCardProps) {
  return (
    <Card className="border-border/60 bg-card/80 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="outline"
            className={cn("border border-transparent", methodStyles[endpoint.method])}
          >
            {endpoint.method}
          </Badge>
          <CardTitle className="text-lg">{endpoint.name}</CardTitle>
          <Badge variant="secondary" className="inline-flex items-center gap-1">
            {endpoint.status === "ready" ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <Info className="h-3.5 w-3.5" />
            )}
            {endpoint.status}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Endpoint</span>
          <span className="rounded-lg bg-muted px-2 py-1 font-mono text-[11px] text-foreground">
            {endpoint.path}
          </span>
          <span className="rounded-lg bg-muted px-2 py-1 font-mono text-[11px] text-foreground">
            application/json
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{endpoint.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {endpoint.testable ? (
          <ApiTester endpoint={endpoint} />
        ) : (
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/40 p-4 text-sm text-muted-foreground">
            Endpoint ini hanya dokumentasi contoh. Aktifkan test setelah endpoint
            tersedia di backend.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
