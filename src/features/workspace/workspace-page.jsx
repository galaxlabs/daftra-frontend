import { useEffect, useMemo, useState } from "react";
import { ArrowUpRightIcon, FileTextIcon, PlusIcon, RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { SearchSelect } from "@/components/shared/search-select";
import { call } from "@/lib/api";

const numericTypes = new Set(["Float", "Currency", "Percent", "Int"]);

function createLabel(field, t) {
  return t(field.fieldname || field.label || "field");
}

export function WorkspacePage({ document, t, notify, onOpenPrintStudio }) {
  const [workspace, setWorkspace] = useState(null);
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({});

  const createTitle = useMemo(() => ({ Client: t("create_client"), Product: t("create_product"), Booking: t("create_booking"), "Time Entry": t("create_time_entry"), "Sales Invoice": t("create_invoice"), "Sales Quotation": t("create_quotation"), "Invoice Payment": t("create_payment"), "Recurring Invoice": t("create_recurring_invoice") }[document?.doctype] || t("create_record")), [document?.doctype, t]);

  useEffect(() => {
    if (!document?.doctype) return;
    setWorkspace(null);
    setDetail(null);
    setSearch("");
    loadWorkspace(document.doctype, document.view_key, "");
  }, [document?.doctype, document?.view_key]);

  async function loadWorkspace(doctype, viewKey, term) {
    try {
      const result = await call("daftra.api.business_cycle.get_frontend_workspace", { args: { doctype, view_key: viewKey, search: term, limit: 25 } });
      setWorkspace(result);
      const blank = {};
      (result.create_fields || []).forEach((field) => { blank[field.fieldname] = ""; });
      setForm(blank);
      if (result.records?.[0]) {
        loadDetail(doctype, viewKey, result.records[0].name);
      }
    } catch (error) {
      notify(error.message);
    }
  }

  async function loadDetail(doctype, viewKey, name) {
    try {
      setDetail(await call("daftra.api.business_cycle.get_frontend_record", { args: { doctype, view_key: viewKey, name } }));
    } catch (error) {
      notify(error.message);
    }
  }

  async function submit() {
    if (!workspace?.doctype) return;
    setBusy(true);
    try {
      const payload = { ...form };
      (workspace.create_fields || []).forEach((field) => {
        if (numericTypes.has(field.type) && payload[field.fieldname] !== "") payload[field.fieldname] = Number(payload[field.fieldname]);
      });
      const created = await call("daftra.api.business_cycle.create_frontend_workspace_record", { mutation: true, args: { doctype: workspace.doctype, view_key: document.view_key, payload } });
      notify(`${t("created_successfully")} ${created.name}`);
      await loadWorkspace(workspace.doctype, document.view_key, search);
      await loadDetail(workspace.doctype, document.view_key, created.name);
    } catch (error) {
      notify(error.message);
    } finally {
      setBusy(false);
    }
  }

  if (!document) {
    return <Card className="rounded-[2rem] border-0 shadow-sm ring-1 ring-border/60"><CardContent className="grid min-h-[24rem] place-items-center p-8 text-center text-muted-foreground">{t("no_document_selected")}</CardContent></Card>;
  }

  return (
    <Card className="rounded-[2rem] border-0 shadow-sm ring-1 ring-border/60">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>{document.label || document.doctype}</CardTitle>
          <CardDescription>{document.module}</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-2xl" onClick={() => onOpenPrintStudio(document)}><ArrowUpRightIcon data-icon="inline-start" />{t("open_print_studio")}</Button>
          <Button variant="outline" size="icon" className="rounded-2xl" onClick={() => loadWorkspace(document.doctype, document.view_key, search)}><RefreshCwIcon /></Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-[0.8fr_1fr_0.9fr]">
        <Card className="rounded-3xl border border-border/70 bg-muted/35 shadow-none">
          <CardHeader>
            <CardTitle>{t("workspace_records")}</CardTitle>
            <CardDescription>{workspace?.records?.length || 0} rows</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === "Enter" ? loadWorkspace(document.doctype, document.view_key, event.currentTarget.value) : null} placeholder={t("search_workspace")} className="rounded-2xl" />
            <ScrollArea className="h-[28rem]">
              <div className="grid gap-2">
                {(workspace?.records || []).map((record) => (
                  <button key={record.name} type="button" className={`rounded-2xl border px-4 py-3 text-start ${detail?.name === record.name ? "border-primary/30 bg-background" : "border-border/60 bg-background/80"}`} onClick={() => loadDetail(workspace.doctype, document.view_key, record.name)}>
                    <div className="text-sm font-semibold">{record.title || record.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{record.subtitle || record.name}</div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border border-border/70 bg-muted/35 shadow-none">
          <CardHeader>
            <CardTitle>{t("record_detail")}</CardTitle>
            <CardDescription>{detail?.name || document.doctype}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-2">
              {detail ? Object.entries(detail).filter(([key]) => key !== "items").map(([key, value]) => value ? <div key={key} className="rounded-2xl border border-border/60 bg-background p-3"><div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{key.replaceAll("_", " ")}</div><div className="mt-2 text-sm font-medium leading-6">{String(value)}</div></div> : null) : <div className="text-sm text-muted-foreground">{t("loading")}</div>}
            </div>
            {detail?.items?.length ? <><Separator /><div className="grid gap-2">{detail.items.map((item, index) => <div key={`${item.item}-${index}`} className="grid grid-cols-4 gap-3 rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm"><span className="col-span-2 truncate">{item.description || item.item}</span><span>{item.qty}</span><span>{item.amount}</span></div>)}</div></> : null}
          </CardContent>
        </Card>
        <Card className="rounded-3xl border border-border/70 bg-muted/35 shadow-none">
          <CardHeader>
            <CardTitle>{createTitle}</CardTitle>
            <CardDescription>{t("create_form")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {(workspace?.create_fields || []).map((field) => {
              const value = form[field.fieldname] ?? "";
              if (field.type === "Link") {
                const source = workspace.options?.[field.options_key] || [];
                const options = field.options_key === "clients"
                  ? source.map((row) => ({ value: row.name, label: row.business_name || row.first_name || row.name, description: row.tax_id || "" }))
                  : field.options_key === "invoices"
                    ? source.map((row) => ({ value: row.name, label: row.name, description: `${row.client || ""} · ${row.balance || row.total || 0}` }))
                    : source.map((row) => ({ value: row.name, label: row.product_name || row.product_code || row.name, description: `${row.product_type || ""} · ${row.selling_price || 0}` }));
                return <SearchSelect key={field.fieldname} label={field.label} value={value} onChange={(next) => setForm({ ...form, [field.fieldname]: next })} options={options} placeholder={field.label} />;
              }
              if (field.type === "Select") {
                return <SearchSelect key={field.fieldname} label={field.label} value={value} onChange={(next) => setForm({ ...form, [field.fieldname]: next })} options={(field.options || []).map((option) => ({ value: option, label: option }))} placeholder={field.label} />;
              }
              if (field.type === "Text") {
                return <label key={field.fieldname} className="grid gap-2 text-sm font-medium">{field.label}<Textarea value={value} onChange={(event) => setForm({ ...form, [field.fieldname]: event.target.value })} className="min-h-28 rounded-3xl" /></label>;
              }
              const type = field.type === "Date" ? "date" : field.type === "Time" ? "time" : numericTypes.has(field.type) ? "number" : "text";
              return <label key={field.fieldname} className="grid gap-2 text-sm font-medium">{field.label}<Input type={type} value={value} onChange={(event) => setForm({ ...form, [field.fieldname]: event.target.value })} className="rounded-2xl" /></label>;
            })}
            <Button className="rounded-2xl" disabled={busy} onClick={submit}><PlusIcon data-icon="inline-start" />{busy ? t("loading") : t("create_record")}</Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
