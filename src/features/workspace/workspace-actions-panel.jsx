import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, Building2, RefreshCw, UserPlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SearchSelect } from "@/components/shared/search-select";
import { call } from "@/lib/api";

const COPY_TARGET_MAP = {
  "Purchase Request": ["Purchase Quotation"],
  "Purchase Quotation": ["Purchase Order", "Purchase Invoice"],
  "Purchase Order": ["Purchase Invoice"],
  "Sales Quotation": ["Purchase Quotation", "Purchase Order"],
  "Sales Invoice": ["Purchase Quotation", "Purchase Order", "Purchase Invoice"],
};

const TARGET_LABELS = {
  "Purchase Quotation": "copy_to_purchase_quotation",
  "Purchase Order": "copy_to_purchase_order",
  "Purchase Invoice": "copy_to_purchase_invoice",
};

const PORTAL_LABELS = {
  quotations: "Quotations",
  invoices: "Invoices",
  payments: "Payments",
  appointments: "Appointments",
  bookings: "Bookings",
  orders: "Orders",
};

function partyTypeFor(doctype) {
  if (doctype === "Client") return "Client";
  if (doctype === "Supplier") return "Supplier";
  return null;
}

export function WorkspaceActionsPanel({ document, detail, workspace, t, notify, onReload, onJumpToDocument }) {
  const [copyTarget, setCopyTarget] = useState("");
  const [supplier, setSupplier] = useState("");
  const [portalEmail, setPortalEmail] = useState("");
  const [portalDocs, setPortalDocs] = useState(null);
  const [loadingPortalDocs, setLoadingPortalDocs] = useState(false);
  const [busyAction, setBusyAction] = useState("");

  const partyType = partyTypeFor(document?.doctype);
  const copyTargets = useMemo(
    () => (COPY_TARGET_MAP[document?.doctype] || []).map((doctype) => ({ value: doctype, label: t(TARGET_LABELS[doctype]) })),
    [document?.doctype, t]
  );
  const supplierOptions = useMemo(
    () => (workspace?.options?.suppliers || []).map((row) => ({
      value: row.name,
      label: row.supplier_name || row.name,
      description: row.email || row.phone || "",
    })),
    [workspace?.options?.suppliers]
  );
  const portalStats = useMemo(
    () => Object.entries(portalDocs || {}).map(([key, rows]) => ({ label: PORTAL_LABELS[key] || key, count: Array.isArray(rows) ? rows.length : 0 })),
    [portalDocs]
  );

  useEffect(() => {
    setPortalEmail(detail?.email || "");
  }, [detail?.name, detail?.email]);

  useEffect(() => {
    if (!partyType || !detail?.name) {
      setPortalDocs(null);
      return;
    }

    setLoadingPortalDocs(true);
    call("daftra.api.portal_api.get_party_portal_documents", { args: { party_type: partyType, party_name: detail.name } })
      .then((result) => setPortalDocs(result))
      .catch(() => setPortalDocs(null))
      .finally(() => setLoadingPortalDocs(false));
  }, [partyType, detail?.name]);

  async function createPortalUser() {
    if (!partyType || !detail?.name) return;
    try {
      setBusyAction("portal");
      const result = await call("daftra.api.portal_api.create_party_portal_user", {
        mutation: true,
        args: {
          party_type: partyType,
          party_name: detail.name,
          email: portalEmail || detail.email || undefined,
        },
      });
      notify({ type: "success", message: `${t("portal_ready")} ${result.email}` });
      const docs = await call("daftra.api.portal_api.get_party_portal_documents", { args: { party_type: partyType, party_name: detail.name } });
      setPortalDocs(docs);
    } catch (error) {
      notify({ type: "error", message: error.message });
    } finally {
      setBusyAction("");
    }
  }

  async function copyDocument() {
    if (!document?.doctype || !detail?.name || !copyTarget) return;
    try {
      setBusyAction("copy");
      const createdName = await call("daftra.api.procurement_api.copy_procurement_document_draft", {
        mutation: true,
        args: {
          source_doctype: document.doctype,
          source_name: detail.name,
          target_doctype: copyTarget,
          supplier: supplier || undefined,
        },
      });
      notify({ type: "success", message: `${t("copy_created")} ${copyTarget} ${createdName}` });
      onReload?.();
      onJumpToDocument?.(copyTarget);
    } catch (error) {
      notify({ type: "error", message: error.message });
    } finally {
      setBusyAction("");
    }
  }

  if (!detail || (!copyTargets.length && !partyType)) {
    return null;
  }

  return (
    <Card className="rounded-3xl border border-border/70 bg-muted/35 shadow-none">
      <CardHeader>
        <CardTitle>{t("records_and_actions")}</CardTitle>
        <CardDescription>{detail.name}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        {copyTargets.length ? (
          <div className="grid gap-3 rounded-3xl border border-border/60 bg-background p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary"><ArrowRightLeft className="size-4" /></div>
              <div>
                <div className="text-sm font-semibold">{t("copy_document")}</div>
                <div className="text-xs text-muted-foreground">{document.label || document.doctype}</div>
              </div>
            </div>
            <SearchSelect label={t("copy_document")} value={copyTarget} onChange={setCopyTarget} options={copyTargets} placeholder={t("choose_document")} />
            {supplierOptions.length ? <SearchSelect label={t("source_supplier")} value={supplier} onChange={setSupplier} options={supplierOptions} placeholder={t("source_supplier")} /> : null}
            <Button className="rounded-2xl" disabled={!copyTarget || busyAction === "copy"} onClick={copyDocument}>
              <ArrowRightLeft data-icon="inline-start" />
              {busyAction === "copy" ? t("loading") : t("copy_document")}
            </Button>
          </div>
        ) : null}

        {partyType ? (
          <div className="grid gap-3 rounded-3xl border border-border/60 bg-background p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary"><UserPlus className="size-4" /></div>
              <div>
                <div className="text-sm font-semibold">{t("create_portal_user")}</div>
                <div className="text-xs text-muted-foreground">{partyType}</div>
              </div>
            </div>
            <label className="grid gap-2 text-sm font-medium">
              {t("portal_email")}
              <Input value={portalEmail} onChange={(event) => setPortalEmail(event.target.value)} className="rounded-2xl" placeholder={detail.email || t("portal_email")} />
            </label>
            <div className="flex gap-2">
              <Button className="rounded-2xl" disabled={busyAction === "portal"} onClick={createPortalUser}>
                <UserPlus data-icon="inline-start" />
                {busyAction === "portal" ? t("loading") : t("create_portal_user")}
              </Button>
              <Button variant="outline" className="rounded-2xl" disabled={loadingPortalDocs || !detail?.name} onClick={() => {
                setLoadingPortalDocs(true);
                call("daftra.api.portal_api.get_party_portal_documents", { args: { party_type: partyType, party_name: detail.name } })
                  .then((result) => setPortalDocs(result))
                  .catch((error) => notify({ type: "error", message: error.message }))
                  .finally(() => setLoadingPortalDocs(false));
              }}>
                <RefreshCw data-icon="inline-start" />
                {t("refresh")}
              </Button>
            </div>
            <div className="grid gap-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Building2 className="size-4 text-primary" />
                <span>{t("portal_documents")}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(portalStats.length ? portalStats : [{ label: t("portal_documents"), count: 0 }]).map((stat) => (
                  <Badge key={stat.label} variant="outline" className="rounded-full px-3 py-1 text-xs">
                    {stat.label}: {stat.count}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
