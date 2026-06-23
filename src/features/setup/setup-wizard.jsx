import { useEffect, useMemo, useState } from "react";
import { CheckCircle2Icon, SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { SearchSelect } from "@/components/shared/search-select";

const moduleFields = [
  ["enable_sales_module", "Sales"],
  ["enable_clients_module", "Clients"],
  ["enable_inventory_module", "Inventory"],
  ["enable_purchases_module", "Purchases"],
  ["enable_accounting_module", "Accounting"],
  ["enable_hr_module", "HR"],
  ["enable_pos_module", "POS"],
  ["enable_bookings_module", "Bookings"],
  ["enable_time_tracking_module", "Time Tracking"],
  ["enable_tax_module", "Tax"],
];

const presets = {
  Services: { enable_sales_module: true, enable_clients_module: true, enable_inventory_module: false, enable_purchases_module: false, enable_accounting_module: true, enable_hr_module: true, enable_pos_module: false, enable_bookings_module: true, enable_time_tracking_module: true, enable_tax_module: true },
  Trading: { enable_sales_module: true, enable_clients_module: true, enable_inventory_module: true, enable_purchases_module: true, enable_accounting_module: true, enable_hr_module: false, enable_pos_module: true, enable_bookings_module: false, enable_time_tracking_module: false, enable_tax_module: true },
  Retail: { enable_sales_module: true, enable_clients_module: true, enable_inventory_module: true, enable_purchases_module: true, enable_accounting_module: true, enable_hr_module: true, enable_pos_module: true, enable_bookings_module: false, enable_time_tracking_module: false, enable_tax_module: true },
  Wholesale: { enable_sales_module: true, enable_clients_module: true, enable_inventory_module: true, enable_purchases_module: true, enable_accounting_module: true, enable_hr_module: false, enable_pos_module: false, enable_bookings_module: false, enable_time_tracking_module: false, enable_tax_module: true },
  Mixed: { enable_sales_module: true, enable_clients_module: true, enable_inventory_module: true, enable_purchases_module: true, enable_accounting_module: true, enable_hr_module: true, enable_pos_module: true, enable_bookings_module: true, enable_time_tracking_module: true, enable_tax_module: true },
};

function buildForm(setup) {
  const type = setup?.business_type || "Services";
  return {
    company_name: setup?.company_name || "",
    business_type: type,
    business_industry: setup?.business_industry || setup?.industry_options?.[0]?.value || "",
    default_language: setup?.default_language || "English",
    default_currency: setup?.default_currency || "SAR",
    enable_zatca: Boolean(setup?.enable_zatca ?? 1),
    ...presets[type],
  };
}

export function SetupWizard({ open, setup, t, onSave, onClose }) {
  const [form, setForm] = useState(buildForm(setup));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(buildForm(setup));
      setError("");
    }
  }, [open, setup]);

  const businessTypes = setup?.business_types || [];
  const currencies = (setup?.currencies || []).map((item) => ({ value: item, label: item }));
  const languages = (setup?.languages || []).map((item) => ({ value: item.label, label: item.label }));
  const industries = useMemo(() => setup?.business_industries?.[form.business_type] || setup?.industry_options || [], [setup, form.business_type]);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSave(form);
    } catch (saveError) {
      setError(saveError.message || "Setup failed");
    } finally {
      setBusy(false);
    }
  }

  function updateType(nextType) {
    setForm((current) => ({
      ...current,
      business_type: nextType,
      business_industry: (setup?.business_industries?.[nextType] || [])[0]?.value || current.business_industry,
      ...presets[nextType],
    }));
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && !next ? onClose() : null}>
      <DialogContent className="max-w-5xl rounded-[2rem] border-0 bg-card p-0 shadow-2xl">
        <form onSubmit={submit}>
          <DialogHeader className="px-8 pt-8">
            <DialogTitle>{t("wizard_title")}</DialogTitle>
            <DialogDescription>{t("wizard_copy")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 px-8 pb-8 pt-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-medium">
                {t("company_name")}
                <Input value={form.company_name} onChange={(event) => setForm({ ...form, company_name: event.target.value })} placeholder={t("company_placeholder")} className="rounded-2xl" />
              </label>
              <SearchSelect label={t("business_type")} value={form.business_type} onChange={updateType} options={businessTypes} placeholder={t("business_type")} />
              <SearchSelect label={t("business_industry")} value={form.business_industry} onChange={(value) => setForm({ ...form, business_industry: value })} options={industries} placeholder={t("business_industry")} />
              <div className="grid gap-4 md:grid-cols-2">
                <SearchSelect label={t("default_language")} value={form.default_language} onChange={(value) => setForm({ ...form, default_language: value })} options={languages} placeholder={t("default_language")} />
                <SearchSelect label={t("default_currency")} value={form.default_currency} onChange={(value) => setForm({ ...form, default_currency: value })} options={currencies} placeholder={t("default_currency")} />
              </div>
              <label className="flex items-start gap-3 rounded-3xl border border-border/70 bg-muted/50 p-4 text-sm">
                <input type="checkbox" checked={form.enable_zatca} onChange={(event) => setForm({ ...form, enable_zatca: event.target.checked })} className="mt-1 size-4 accent-[var(--primary)]" />
                <span className="flex flex-col gap-1">
                  <strong>{t("enable_zatca")}</strong>
                  <span className="text-muted-foreground">{t("enable_zatca_copy")}</span>
                </span>
              </label>
            </div>
            <div className="grid gap-4">
              <Card className="rounded-[1.75rem] border-0 bg-secondary/65 shadow-none ring-1 ring-border/60">
                <CardContent className="grid gap-4 p-6">
                  <div className="flex items-start gap-3">
                    <SparklesIcon className="mt-0.5 text-primary" />
                    <div className="grid gap-1">
                      <strong>{t("recommended_modules")}</strong>
                      <span className="text-sm text-muted-foreground">{t(form.business_type === "Services" ? "service_mode_copy" : "wizard_copy")}</span>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {moduleFields.map(([field, label]) => (
                      <label key={field} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${form[field] ? "border-primary/30 bg-background" : "border-border/60 bg-background/70"}`}>
                        <input type="checkbox" checked={Boolean(form[field])} onChange={(event) => setForm({ ...form, [field]: event.target.checked })} className="size-4 accent-[var(--primary)]" />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-[1.75rem] border-0 bg-gradient-to-br from-primary/10 via-background to-accent/15 shadow-none ring-1 ring-border/60">
                <CardContent className="flex items-start gap-3 p-6">
                  <CheckCircle2Icon className="mt-1 text-primary" />
                  <div className="grid gap-1">
                    <strong>{t("services_ready")}</strong>
                    <span className="text-sm text-muted-foreground">{t("services_ready_copy")}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          {error ? <p className="mx-8 mb-4 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}
          <DialogFooter className="rounded-b-[2rem] bg-muted/40 px-8 py-6">
            <Button type="button" variant="outline" className="rounded-2xl" onClick={onClose}>{t("later")}</Button>
            <Button type="submit" className="rounded-2xl" disabled={busy}>{busy ? t("loading") : t("save_setup")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
