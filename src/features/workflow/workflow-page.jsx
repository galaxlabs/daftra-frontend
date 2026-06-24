import { useEffect, useMemo, useState } from "react";
import { ArrowUpRightIcon, CheckCircle2Icon, ShieldCheckIcon, SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SearchSelect } from "@/components/shared/search-select";
import { call } from "@/lib/api";

export function WorkflowPage({ boot, t, notify, onOpenPrintStudio }) {
  const [catalog, setCatalog] = useState({ clients: [], products: [], suppliers: [], projects: [], employees: [] });
  const [validation, setValidation] = useState(null);
  const [running, setRunning] = useState(false);
  const [form, setForm] = useState({ client: "", product: "", project: "", employee: "", create_project: true, project_name: "", budget_amount: 0, quantity: 1, rate: 0, vat_rate: 15, invoice_layout: boot.setup?.business_type === "Services" ? "Materials & Services" : "TAX Invoice", payment_method: "Bank Transfer", description_of_work: "", task: "", notes: "", due_date: "", duration_hours: 2, hourly_rate: 0, cost_rate: 0, booking_date: "", booking_time: "10:00" });

  useEffect(() => {
    call("daftra.api.business_cycle.get_service_cycle_context")
      .then((result) => setCatalog(result.options || { clients: [], products: [], projects: [], employees: [] }))
      .catch((error) => notify(error.message));
  }, [notify]);

  useEffect(() => {
    if (!form.client && catalog.clients.length) setForm((current) => ({ ...current, client: catalog.clients[0].name }));
    if (!form.product && catalog.products.length) setForm((current) => ({ ...current, product: catalog.products[0].name }));
  }, [catalog, form.client, form.product]);

  useEffect(() => {
    if (!form.client) return;
    call("daftra.api.business_cycle.get_service_cycle_context", { args: { client_name: form.client, product_name: form.product, project_name: form.project } })
      .then((result) => {
        const recommended = result.recommended || {};
        const next = {};
        if (!form.due_date && recommended.due_date) next.due_date = recommended.due_date;
        if (result.product) {
          next.rate = Number(result.product.selling_price || 0);
          next.vat_rate = Number(result.product.vat_rate || 15);
          next.hourly_rate = Number(result.product.selling_price || 0);
          next.cost_rate = Number(result.product.purchase_price || result.product.selling_price || 0);
          if (!form.description_of_work) next.description_of_work = result.product.description || result.product.product_name;
          if (!form.task) next.task = recommended.task || result.product.product_name;
          if (!form.project_name) next.project_name = result.product.product_name;
        }
        if (Object.keys(next).length) setForm((current) => ({ ...current, ...next }));
      })
      .catch(() => {});
  }, [form.client, form.product, form.project, form.due_date, form.description_of_work, form.task, form.project_name]);

  const clientOptions = useMemo(() => catalog.clients.map((item) => ({ value: item.name, label: item.business_name || item.first_name || item.name, description: item.tax_id || item.client_type || "" })), [catalog.clients]);
  const productOptions = useMemo(() => catalog.products.map((item) => ({ value: item.name, label: item.product_name || item.product_code, description: `${item.product_type || ""} · ${item.selling_price || 0}` })), [catalog.products]);
  const projectOptions = useMemo(() => catalog.projects.map((item) => ({ value: item.name, label: item.project_name || item.project_code || item.name, description: `${item.project_code || ""} · ${item.status || ""}` })), [catalog.projects]);
  const employeeOptions = useMemo(() => catalog.employees.map((item) => ({ value: item.name, label: item.employee_name || item.employee_id || item.name, description: item.email || "" })), [catalog.employees]);
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

  async function runCycle() {
    try {
      setRunning(true);
      const result = await call("daftra.api.business_cycle.run_service_cycle", {
        mutation: true,
        args: {
          client: form.client,
          product: form.product,
          item: form.product,
          employee: form.employee,
          project: form.create_project ? "" : form.project,
          create_project: form.create_project ? 1 : 0,
          project_name: form.project_name,
          expected_revenue: grandTotal,
          budget_amount: Number(form.budget_amount || 0),
          booking_date: form.booking_date,
          booking_time: form.booking_time ? `${form.booking_time}:00` : "10:00:00",
          duration_hours: Number(form.duration_hours || 0),
          hourly_rate: Number(form.hourly_rate || 0),
          cost_rate: Number(form.cost_rate || 0),
          qty: Number(form.quantity || 0),
          rate: Number(form.rate || 0),
          vat_rate: Number(form.vat_rate || 0),
          invoice_layout: form.invoice_layout,
          due_date: form.due_date,
          description_of_work: form.description_of_work,
          task: form.task,
          service: productOptions.find((item) => item.value === form.product)?.label || form.task,
          product_label: productOptions.find((item) => item.value === form.product)?.label || "",
          notes: form.notes,
          project_title: form.project_name,
        },
      });
      notify(`${t("service_cycle_created")} ${result.invoice?.name || ""}`);
      setForm((current) => ({ ...current, project: result.project?.name || current.project }));
      if (result.invoice?.name) onOpenPrintStudio({ doctype: "Sales Invoice", name: result.invoice.name });
    } catch (error) {
      notify(error.message);
    } finally {
      setRunning(false);
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
            <label className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm font-medium md:col-span-2"><input type="checkbox" checked={Boolean(form.create_project)} onChange={(event) => setForm({ ...form, create_project: event.target.checked })} className="size-4 rounded border-border text-primary focus:ring-primary" />{t("create_project_toggle")}</label>
            {form.create_project ? <label className="grid gap-2 text-sm font-medium">{t("project_title")}<Input type="text" value={form.project_name} onChange={(event) => setForm({ ...form, project_name: event.target.value })} className="rounded-2xl" /></label> : <SearchSelect label={t("project")} value={form.project} onChange={(value) => setForm({ ...form, project: value })} options={projectOptions} placeholder={t("project")} />}
            <SearchSelect label={t("employee")} value={form.employee} onChange={(value) => setForm({ ...form, employee: value })} options={employeeOptions} placeholder={t("employee")} />
            <label className="grid gap-2 text-sm font-medium">{t("budget_amount")}<Input type="number" value={form.budget_amount} onChange={(event) => setForm({ ...form, budget_amount: event.target.value })} className="rounded-2xl" /></label>
            <label className="grid gap-2 text-sm font-medium">{t("booking_date")}<Input type="date" value={form.booking_date} onChange={(event) => setForm({ ...form, booking_date: event.target.value })} className="rounded-2xl" /></label>
            <label className="grid gap-2 text-sm font-medium">{t("booking_time")}<Input type="time" value={form.booking_time} onChange={(event) => setForm({ ...form, booking_time: event.target.value })} className="rounded-2xl" /></label>
            <label className="grid gap-2 text-sm font-medium">{t("service_task")}<Input type="text" value={form.task} onChange={(event) => setForm({ ...form, task: event.target.value })} className="rounded-2xl" /></label>
            <label className="grid gap-2 text-sm font-medium">{t("duration_hours")}<Input type="number" value={form.duration_hours} onChange={(event) => setForm({ ...form, duration_hours: event.target.value })} className="rounded-2xl" /></label>
            <label className="grid gap-2 text-sm font-medium">{t("hourly_rate")}<Input type="number" value={form.hourly_rate} onChange={(event) => setForm({ ...form, hourly_rate: event.target.value })} className="rounded-2xl" /></label>
            <label className="grid gap-2 text-sm font-medium">Cost rate<Input type="number" value={form.cost_rate} onChange={(event) => setForm({ ...form, cost_rate: event.target.value })} className="rounded-2xl" /></label>
            <SearchSelect label={t("layout")} value={form.invoice_layout} onChange={(value) => setForm({ ...form, invoice_layout: value })} options={["Materials & Services", "Default Invoice", "TAX Invoice", "Receipt"].map((item) => ({ value: item, label: item }))} placeholder={t("layout")} />
            <label className="grid gap-2 text-sm font-medium">{t("quantity")}<Input type="number" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} className="rounded-2xl" /></label>
            <label className="grid gap-2 text-sm font-medium">{t("rate")}<Input type="number" value={form.rate} onChange={(event) => setForm({ ...form, rate: event.target.value })} className="rounded-2xl" /></label>
            <label className="grid gap-2 text-sm font-medium">{t("vat_rate")}<Input type="number" value={form.vat_rate} onChange={(event) => setForm({ ...form, vat_rate: event.target.value })} className="rounded-2xl" /></label>
            <label className="grid gap-2 text-sm font-medium">{t("due_date")}<Input type="date" value={form.due_date} onChange={(event) => setForm({ ...form, due_date: event.target.value })} className="rounded-2xl" /></label>
          </div>
          <label className="grid gap-2 text-sm font-medium">{t("description_of_work")}<Textarea value={form.description_of_work} onChange={(event) => setForm({ ...form, description_of_work: event.target.value })} className="min-h-32 rounded-3xl" /></label>
          <label className="grid gap-2 text-sm font-medium">{t("internal_notes")}<Textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="min-h-28 rounded-3xl" /></label>
          <div className="flex flex-wrap gap-3">
            <Button className="rounded-2xl" onClick={validateLocal}><CheckCircle2Icon data-icon="inline-start" />{t("validate_business_cycle")}</Button>
            <Button className="rounded-2xl" variant="secondary" onClick={runCycle} disabled={running}><SparklesIcon data-icon="inline-start" />{running ? t("loading") : t("run_service_cycle")}</Button>
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
              [t("project"), form.create_project ? (form.project_name || "Pending project") : (projectOptions.find((item) => item.value === form.project)?.label || "Choose a project")],
              [t("service_name"), productOptions.find((item) => item.value === form.product)?.label || t("choose_document")],
              ["Subtotal", subtotal.toFixed(2)],
              ["VAT", vatTotal.toFixed(2)],
              ["Total", grandTotal.toFixed(2)],
            ].map(([label, value]) => <div key={label} className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/40 px-4 py-3"><span className="text-sm text-muted-foreground">{label}</span><strong>{value}</strong></div>)}
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-0 shadow-sm ring-1 ring-border/60">
          <CardContent className="grid gap-3 p-6">
            <div className="flex items-start gap-3 rounded-3xl border border-border/70 bg-muted/40 p-4"><SparklesIcon className="mt-1 text-primary" /><div className="grid gap-1"><strong>{t("auto_fill_logic")}</strong><span className="text-sm text-muted-foreground">Client defaults, project context, service pricing, and due dates are prepared before the cycle is posted.</span></div></div>
            <div className="flex items-start gap-3 rounded-3xl border border-border/70 bg-muted/40 p-4"><ShieldCheckIcon className="mt-1 text-primary" /><div className="grid gap-1"><strong>{t("zatca_logic")}</strong><span className="text-sm text-muted-foreground">The server validates invoice totals, creates the service records, and keeps project profitability connected to accounting.</span></div></div>
            {validation && !validation.ok ? <div className="rounded-3xl bg-destructive/10 p-4 text-sm text-destructive">{validation.errors.join(" · ")}</div> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
