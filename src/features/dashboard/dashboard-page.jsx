import { ActivityIcon, ArrowUpRightIcon, CalendarDaysIcon, CircleDollarSignIcon, Clock3Icon, FileTextIcon, PackageCheckIcon, PrinterIcon, ShieldCheckIcon, SparklesIcon, WarehouseIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatCard } from "@/components/shared/stat-card";

export function DashboardPage({ boot, currencyNode, t, activeTabLabel, selectedDocument, onSelectDocument, onOpenPrintStudio, onRunScenario }) {
  const printableDocs = (boot.document_catalog || []).filter((item) => item.templates.length > 0);
  const stats = [
    { label: t("revenue"), value: currencyNode, hint: "Live backend totals", icon: CircleDollarSignIcon },
    { label: t("invoices"), value: boot.stats.total_invoices || 0, hint: "Operational sales docs", icon: FileTextIcon },
    { label: t("products"), value: boot.stats.total_products || 0, hint: "Inventory catalog", icon: PackageCheckIcon },
    { label: t("low_stock"), value: boot.low_stock.length || 0, hint: "Needs replenishment", icon: WarehouseIcon },
  ];
  if (boot.setup?.business_type === "Services") {
    stats.push({ label: t("bookings"), value: boot.stats.total_bookings || 0, hint: "Booked sessions", icon: CalendarDaysIcon });
    stats.push({ label: t("time_entries"), value: boot.stats.total_time_entries || 0, hint: "Billable hours", icon: Clock3Icon });
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden rounded-[2rem] border-0 bg-[linear-gradient(135deg,rgba(17,74,60,0.96),rgba(20,96,76,0.94))] text-white shadow-xl">
          <CardContent className="grid gap-6 p-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-white/12 text-white hover:bg-white/20">{boot.setup?.business_type || "Business"}</Badge>
              <Badge className="bg-white/12 text-white hover:bg-white/20">{printableDocs.length} {t("document_catalog")}</Badge>
            </div>
            <div className="grid gap-3">
              <h2 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight md:text-4xl">A front-office ERP surface for sales, services, bookings, and print operations.</h2>
              <p className="max-w-2xl text-sm text-white/75">This app stays outside Frappe Desk, speaks directly to your Daftra backend APIs, and keeps Arabic-first workflows in view.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" className="rounded-2xl bg-white text-primary hover:bg-white/90" onClick={() => onRunScenario("seed")}>
                <SparklesIcon data-icon="inline-start" />
                {t("load_demo_company")}
              </Button>
              <Button variant="outline" className="rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white" onClick={() => onRunScenario("validate")}>
                <ShieldCheckIcon data-icon="inline-start" />
                {t("validate_business_cycle")}
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-0 bg-card shadow-sm ring-1 ring-border/60">
          <CardHeader>
            <CardTitle>{t("dashboard_intelligence")}</CardTitle>
            <CardDescription>{t("dashboard_intelligence_copy")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {Object.entries(boot.readiness || {}).slice(0, 4).map(([key, check]) => (
              <div key={key} className="rounded-2xl border border-border/70 bg-muted/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <strong className="capitalize">{key.replaceAll("_", " ")}</strong>
                  <Badge variant={check.ok ? "secondary" : "outline"}>{check.ok ? "Ready" : "Watch"}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{check.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((item) => <StatCard key={item.label} icon={item.icon} label={item.label} value={item.value} hint={item.hint} />)}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[2rem] border-0 shadow-sm ring-1 ring-border/60">
          <CardHeader>
            <CardTitle>{activeTabLabel}</CardTitle>
            <CardDescription>{t("records_and_actions")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {(boot.document_catalog || []).slice(0, 8).map((document) => (
              <button key={`${document.module}-${document.doctype}`} type="button" onClick={() => onSelectDocument(document)} className={`rounded-3xl border p-4 text-start transition hover:border-primary/30 hover:bg-muted/40 ${selectedDocument?.doctype === document.doctype ? "border-primary/30 bg-muted/50" : "border-border/70 bg-background"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{document.doctype}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{document.module}</div>
                  </div>
                  <ArrowUpRightIcon className="text-muted-foreground" />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{document.templates.length ? document.templates.join(" · ") : "Workspace-first frontend record view"}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="rounded-[2rem] border-0 shadow-sm ring-1 ring-border/60">
            <CardHeader>
              <CardTitle>{t("document_catalog")}</CardTitle>
              <CardDescription>{printableDocs.length} printable documents available in the frontend.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {printableDocs.slice(0, 10).map((document) => <Badge key={document.doctype} variant="outline">{document.doctype}</Badge>)}
              <Button variant="outline" className="ms-auto rounded-2xl" onClick={() => onOpenPrintStudio(selectedDocument)}>
                <PrinterIcon data-icon="inline-start" />
                {t("open_print_studio")}
              </Button>
            </CardContent>
          </Card>
          <Card className="rounded-[2rem] border-0 shadow-sm ring-1 ring-border/60">
            <CardHeader>
              <CardTitle>{t("recent_activity")}</CardTitle>
              <CardDescription>{t("audit_trail")}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {(boot.recent_activity || []).slice(0, 6).map((row) => (
                <div key={`${row.doctype}-${row.name}`} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/40 px-4 py-3">
                  <ActivityIcon className="text-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{row.doctype}</div>
                    <div className="truncate text-xs text-muted-foreground">{row.name}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <Card className="rounded-[2rem] border-0 shadow-sm ring-1 ring-border/60">
        <CardHeader>
          <CardTitle>{t("service_cycle")}</CardTitle>
          <CardDescription>{t("service_cycle_copy")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-4">
          {(boot.scenarios || []).map((scenario) => (
            <Card key={scenario.key} className="rounded-3xl border border-border/70 bg-muted/35 shadow-none">
              <CardContent className="grid h-full gap-4 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{scenario.key}</div>
                <div className="text-lg font-semibold">{scenario.label}</div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {scenario.steps.map((step) => <span key={step}>{step}</span>)}
                </div>
                <Separator />
                <Button variant="outline" className="mt-auto rounded-2xl" onClick={() => onRunScenario(scenario.key)}>
                  <SparklesIcon data-icon="inline-start" />
                  Run
                </Button>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
