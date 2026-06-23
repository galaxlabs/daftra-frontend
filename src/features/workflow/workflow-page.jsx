import { useEffect, useMemo, useState } from "react";
import { ArrowUpRightIcon, CheckCircle2Icon, ShieldCheckIcon, SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SearchSelect } from "@/components/shared/search-select";
import { call } from "@/lib/api";

export function WorkflowPage({ boot, t, notify, onOpenPrintStudio }) {
  const [catalog, setCatalog] = useState({ clients: [], products: [], suppliers: [] });
  const [validation, setValidation] = useState(null);
  const [form, setForm] = useState({ client: "", product: "", quantity: 1, rate: 0, vat_rate: 15, invoice_layout: boot.setup?.business_type === "Services" ? "Materials & Services" : "TAX Invoice", payment_method: "Bank Transfer", description_of_work: "", notes: "", due_date: "" });

  useEffect(() => {
    call("daftra.api.sales_api.get_workflow_catalog")
      .then(setCatalog)
      .catch((error) => notify(error.message));
  }, [notify]);

  useEffect(() => {
    if (!form.client && catalog.clients.length) setForm((current) => ({ ...current, client: catalog.clients[0].name }));
    if (!form.product && catalog.products.length) setForm((current) => ({ ...current, product: catalog.products[0].name }));
  }, [catalog, form.client, form.product]);

  useEffect(() => {
    if (!form.client) return;
    call("daftra.api.sales_api.get_sales_workflow_context", { args: { client_name: form.client, product_name: form.product } })
      .then((result) => {
        const next = {};
        if (result.client?.display_name) next.description_of_work = `${result.client.display_name} service cycle`;
        if (!form.due_date && result.due_date) next.due_date = result.due_date;
        if (result.product) {
          next.rate = Number(result.product.selling_price || 0);
          next.vat_rate = Number(result.product.vat_rate || 15);
          if (!form.description_of_work) next.description_of_work = result.product.description || result.product.product_name;
        }
        if (Object.keys(next).length) setForm((current) => ({ ...current, ...next }));
      })
      .catch(() => {});
  }, [form.client, form.product, form.due_date, form.description_of_work]);

  const clientOptions = useMemo(() => catalog.clients.map((item) => ({ value: item.name, label: item.business_name || item.first_name || item.name, description: item.tax_id || item.client_type || "" })), [catalog.clients]);
  const productOptions = useMemo(() => catalog.products.map((item) => ({ value: item.name, label: item.product_name || item.product_code, description: `${item.product_type || ""} · ${item.selling_price || 0}` })), [catalog.products]);
  const subtotal = Number(form.quantity || 0) * Number(form.rate || 0);
  const vatTotal = subtotal * Number(form.vat_rate || 0) / 100;
  const grandTotal = subtotal + vatTotal;

  async function validateLocal() {
    try {
      const result = await call("daftra.api.sales_api.validate_sales_invoice_payload", {
        mutation: true,
        args: { payload: { client: form.client, invoice_layout: form.invoice_layout, description_of_work: form.description_of_work, notes: form.notes, due_date: form.due_date, items: [{ qty: Number(form.quantity || 0), rate: Number(form.rate || 0), vat_rate: Number(form.vat_rate || 0) }], discount_amount: 0, deposit_amount: 0, adjustment_amount: 0 } },
      });
      setValidation(result);
      notify(result.ok ? "Workflow rules validated." : result.errors.join(" · "));
    } catch (error) {
      notify(error.message);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card className="rounded-[2rem] border-0 shadow-sm ring-1 ring-border/60">
        <CardHeader>
          <CardTitle>{t("workflow_studio")}</CardTitle>
          <CardDescription>{t("service_mode_copy")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <SearchSelect label={t("client_name")} value={form.client} onChange={(value) => setForm({ ...form, client: value })} options={clientOptions} placeholder={t("client_name")} />
            <SearchSelect label={t("service_name")} value={form.product} onChange={(value) => setForm({ ...form, product: value })} options={productOptions} placeholder={t("service_name")} />
            <SearchSelect label={t("layout")} value={form.invoice_layout} onChange={(value) => setForm({ ...form, invoice_layout: value })} options={["Materials & Services", "Default Invoice", "TAX Invoice", "Receipt"].map((item) => ({ value: item, label: item }))} placeholder={t("layout")} />
            <SearchSelect label={t("payment_method")} value={form.payment_method} onChange={(value) => setForm({ ...form, payment_method: value })} options={["Bank Transfer", "Cash", "Card", "Cheque"].map((item) => ({ value: item, label: item }))} placeholder={t("payment_method")} />
            <label className="grid gap-2 text-sm font-medium">{t("quantity")}<Input type="number" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} className="rounded-2xl" /></label>
            <label className="grid gap-2 text-sm font-medium">{t("rate")}<Input type="number" value={form.rate} onChange={(event) => setForm({ ...form, rate: event.target.value })} className="rounded-2xl" /></label>
            <label className="grid gap-2 text-sm font-medium">{t("vat_rate")}<Input type="number" value={form.vat_rate} onChange={(event) => setForm({ ...form, vat_rate: event.target.value })} className="rounded-2xl" /></label>
            <label className="grid gap-2 text-sm font-medium">{t("due_date")}<Input type="date" value={form.due_date} onChange={(event) => setForm({ ...form, due_date: event.target.value })} className="rounded-2xl" /></label>
          </div>
          <label className="grid gap-2 text-sm font-medium">{t("description_of_work")}<Textarea value={form.description_of_work} onChange={(event) => setForm({ ...form, description_of_work: event.target.value })} className="min-h-32 rounded-3xl" /></label>
          <label className="grid gap-2 text-sm font-medium">{t("internal_notes")}<Textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="min-h-28 rounded-3xl" /></label>
          <div className="flex flex-wrap gap-3">
            <Button className="rounded-2xl" onClick={validateLocal}><CheckCircle2Icon data-icon="inline-start" />{t("validate_business_cycle")}</Button>
            <Button variant="outline" className="rounded-2xl" onClick={() => onOpenPrintStudio({ doctype: "Sales Invoice" })}><ArrowUpRightIcon data-icon="inline-start" />{t("open_print_studio")}</Button>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4">
        <Card className="rounded-[2rem] border-0 shadow-sm ring-1 ring-border/60">
          <CardHeader>
            <CardTitle>{t("service_cycle")}</CardTitle>
            <CardDescription>{t("service_cycle_copy")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              [t("client_name"), clientOptions.find((item) => item.value === form.client)?.label || t("choose_document")],
              [t("service_name"), productOptions.find((item) => item.value === form.product)?.label || t("choose_document")],
              ["Subtotal", subtotal.toFixed(2)],
              ["VAT", vatTotal.toFixed(2)],
              ["Total", grandTotal.toFixed(2)],
            ].map(([label, value]) => <div key={label} className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/40 px-4 py-3"><span className="text-sm text-muted-foreground">{label}</span><strong>{value}</strong></div>)}
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-0 shadow-sm ring-1 ring-border/60">
          <CardContent className="grid gap-3 p-6">
            <div className="flex items-start gap-3 rounded-3xl border border-border/70 bg-muted/40 p-4"><SparklesIcon className="mt-1 text-primary" /><div className="grid gap-1"><strong>{t("auto_fill_logic")}</strong><span className="text-sm text-muted-foreground">{t("auto_fill_logic_copy")}</span></div></div>
            <div className="flex items-start gap-3 rounded-3xl border border-border/70 bg-muted/40 p-4"><ShieldCheckIcon className="mt-1 text-primary" /><div className="grid gap-1"><strong>{t("zatca_logic")}</strong><span className="text-sm text-muted-foreground">{t("zatca_logic_copy")}</span></div></div>
            {validation && !validation.ok ? <div className="rounded-3xl bg-destructive/10 p-4 text-sm text-destructive">{validation.errors.join(" · ")}</div> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
