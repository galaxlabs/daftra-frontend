import { useEffect, useMemo, useState } from "react";
import { PrinterIcon, RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchSelect } from "@/components/shared/search-select";
import { call } from "@/lib/api";

export function PrintPage({ initialDocument, t, notify, onReturn }) {
  const [data, setData] = useState({ templates: [], documents: [] });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(initialDocument || null);
  const [record, setRecord] = useState("");
  const [options, setOptions] = useState({});
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    call("daftra.api.business_cycle.get_print_studio")
      .then((result) => {
        setData(result);
        const template = initialDocument ? result.templates.find((item) => item.doctype === initialDocument.doctype) || result.templates[0] : result.templates[0];
        if (template) {
          setSelectedTemplate(template);
          setRecord(template.records?.[0]?.name || "");
          setOptions(template.defaults || {});
        }
        setSelectedDocument(initialDocument || result.documents[0] || null);
      })
      .catch((error) => notify(error.message));
  }, [initialDocument, notify]);

  const templateOptions = useMemo(() => data.templates.map((item) => ({ value: item.key, label: item.label, description: item.description })), [data.templates]);
  const documentOptions = useMemo(() => data.documents.map((item) => ({ value: item.doctype, label: item.doctype, description: item.module })), [data.documents]);
  const recordOptions = useMemo(() => (selectedTemplate?.records || []).map((item) => ({ value: item.name, label: item.name })), [selectedTemplate]);

  async function generatePreview() {
    if (!selectedTemplate || !record) return notify(t("no_preview"));
    setBusy(true);
    try {
      const result = await call("daftra.api.business_cycle.get_print_preview", { mutation: true, args: { doctype: selectedTemplate.doctype, name: record, template_key: selectedTemplate.key, options } });
      setPreview(result.html);
    } catch (error) {
      notify(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="rounded-[2rem] border-0 shadow-sm ring-1 ring-border/60">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>{t("print_studio")}</CardTitle>
            <CardDescription>{t("document_catalog")}</CardDescription>
          </div>
          <Button variant="outline" className="rounded-2xl" onClick={onReturn}>{t("dashboard")}</Button>
        </CardHeader>
        <CardContent className="grid gap-4">
          <SearchSelect label={t("choose_document")} value={selectedDocument?.doctype || ""} onChange={(value) => setSelectedDocument(data.documents.find((item) => item.doctype === value) || null)} options={documentOptions} placeholder={t("choose_document")} />
          <SearchSelect label={t("choose_template")} value={selectedTemplate?.key || ""} onChange={(value) => { const template = data.templates.find((item) => item.key === value); setSelectedTemplate(template || null); setRecord(template?.records?.[0]?.name || ""); setOptions(template?.defaults || {}); setPreview(""); }} options={templateOptions} placeholder={t("choose_template")} />
          <SearchSelect label="Record" value={record} onChange={setRecord} options={recordOptions} placeholder="Record" />
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries({ header: "Header", party: "Party", vat: "VAT", qr: "QR", notes: "Notes", signature: "Signature" }).map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/40 px-4 py-3 text-sm">
                <input type="checkbox" checked={Boolean(options[key])} onChange={(event) => setOptions({ ...options, [key]: event.target.checked })} className="size-4 accent-[var(--primary)]" />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-3">
            <Button className="rounded-2xl" disabled={busy} onClick={generatePreview}><RefreshCwIcon data-icon="inline-start" />{busy ? t("loading") : t("preview_print")}</Button>
            <Button variant="outline" className="rounded-2xl" onClick={() => { const popup = window.open("", "_blank", "noopener,noreferrer"); if (!popup) return; popup.document.write(preview); popup.document.close(); popup.focus(); window.setTimeout(() => popup.print(), 250); }}><PrinterIcon data-icon="inline-start" />Print</Button>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-[2rem] border-0 shadow-sm ring-1 ring-border/60">
        <CardHeader>
          <CardTitle>{t("preview_print")}</CardTitle>
          <CardDescription>{selectedTemplate?.description || t("no_preview")}</CardDescription>
        </CardHeader>
        <CardContent>
          {preview ? <iframe title="Print preview" srcDoc={preview} className="h-[75vh] w-full rounded-3xl border border-border/60 bg-white" /> : <div className="grid min-h-[75vh] place-items-center rounded-3xl border border-dashed border-border/70 bg-muted/30 text-muted-foreground">{t("no_preview")}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
