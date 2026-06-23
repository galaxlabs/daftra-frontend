import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <Card className="rounded-3xl border-0 bg-card/90 shadow-sm ring-1 ring-border/60">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className="rounded-2xl bg-secondary p-2 text-primary">
          <Icon />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
