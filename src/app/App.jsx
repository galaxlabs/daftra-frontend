import { useEffect, useMemo, useState } from "react";
import { LoaderCircleIcon, LogOutIcon } from "lucide-react";
import { toast } from "sonner";

import { AppHeader } from "@/components/app/app-header";
import { AppSidebar } from "@/components/app/app-sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ConnectionDialog } from "@/features/auth/connection-dialog";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { PrintPage } from "@/features/print/print-page";
import { SetupWizard } from "@/features/setup/setup-wizard";
import { WorkflowPage } from "@/features/workflow/workflow-page";
import { WorkspacePage } from "@/features/workspace/workspace-page";
import { getSession, logout, call, saveFrontendSetup } from "@/lib/api";
import { createTranslator, moduleLabel, normalizeLanguage } from "@/lib/i18n";

const DEFAULT_BOOT = { stats: {}, modules: {}, enabled_modules: {}, scenarios: [], low_stock: [], recent_activity: [], setup: {}, document_catalog: [], reports: [], settings: [], plugins: [], readiness: {}, blueprint: { sections: [] } };

function useLocalString(key, fallback) {
  const [value, setValue] = useState(() => window.localStorage.getItem(key) || fallback);
  useEffect(() => window.localStorage.setItem(key, value), [key, value]);
  return [value, setValue];
}

function formatMoney(value, currency, language) {
  return new Intl.NumberFormat(language === "ar" ? "ar-EG" : "en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(value || 0));
}

function pushToast(payload) {
  if (!payload) return;
  if (typeof payload === "string") {
    toast(payload);
    return;
  }
  const type = payload.type || "message";
  const message = payload.message || "";
  const description = payload.description;
  if (typeof toast[type] === "function") {
    toast[type](message, description ? { description } : undefined);
  } else {
    toast(message, description ? { description } : undefined);
  }
}

export default function App() {
  const [boot, setBoot] = useState(DEFAULT_BOOT);
  const [activeTab, setActiveTab] = useState("Workflow Studio");
  const [search, setSearch] = useState("");
  const [session, setSession] = useState(null);
  const [connect, setConnect] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [language, setLanguage] = useLocalString("daftra-language", "en");
  const [authReady, setAuthReady] = useState(false);

  const normalizedLanguage = normalizeLanguage(language);
  const t = useMemo(() => createTranslator(normalizedLanguage), [normalizedLanguage]);
  const navigation = useMemo(() => ["Workflow Studio", ...Object.keys(boot.modules || {}), "Print Studio"], [boot.modules]);
  const workspaceCatalog = useMemo(() => {
    const baseDocs = (boot.document_catalog || []).filter((item) => !(item.module === "Sales" && ["Sales Invoice", "Sales Quotation", "Invoice Payment", "Recurring Invoice"].includes(item.doctype)));
    const salesViews = [
      { module: "Sales", doctype: "Sales Invoice", label: "Invoices", view_key: "sales_invoices", route: "sales-invoices", templates: ["Default Invoice", "TAX Invoice", "Receipt", "Materials & Services"], has_print: true },
      { module: "Sales", doctype: "Sales Invoice", label: "Credit Notes", view_key: "credit_notes", route: "credit-notes", templates: ["Default Invoice", "TAX Invoice"], has_print: true },
      { module: "Sales", doctype: "Sales Invoice", label: "Refund Receipts", view_key: "refund_receipts", route: "refund-receipts", templates: ["Receipt"], has_print: true },
      { module: "Sales", doctype: "Sales Quotation", label: "Quotations", view_key: "sales_quotations", route: "sales-quotations", templates: ["Quotation"], has_print: true },
      { module: "Sales", doctype: "Invoice Payment", label: "Client Payments", view_key: "invoice_payments", route: "invoice-payments", templates: ["Receipt"], has_print: true },
      { module: "Sales", doctype: "Recurring Invoice", label: "Recurring Invoices", view_key: "recurring_invoices", route: "recurring-invoices", templates: [], has_print: false },
    ];
    return [...salesViews, ...baseDocs];
  }, [boot.document_catalog]);
  const filteredDocs = useMemo(() => workspaceCatalog.filter((item) => (item.label || item.doctype).toLowerCase().includes(search.toLowerCase()) || item.doctype.toLowerCase().includes(search.toLowerCase()) || item.module.toLowerCase().includes(search.toLowerCase())), [workspaceCatalog, search]);
  const currentDocument = useMemo(() => selectedDocument || filteredDocs[0] || null, [selectedDocument, filteredDocs]);
  const moduleDocuments = useMemo(() => filteredDocs.filter((item) => item.module === activeTab), [filteredDocs, activeTab]);
  const printDocument = useMemo(() => (boot.document_catalog || []).find((item) => item.doctype === currentDocument?.doctype) || currentDocument, [boot.document_catalog, currentDocument]);
  const currencyNode = useMemo(() => formatMoney(boot.stats.total_invoice_amount, boot.setup?.default_currency || "SAR", normalizedLanguage), [boot.stats.total_invoice_amount, boot.setup?.default_currency, normalizedLanguage]);

  useEffect(() => {
    document.documentElement.lang = normalizedLanguage;
    document.documentElement.dir = normalizedLanguage === "ar" ? "rtl" : "ltr";
  }, [normalizedLanguage]);

  useEffect(() => {
    let cancelled = false;
    getSession().then((current) => {
      if (cancelled) return;
      setSession(current);
      if (current) {
        load().finally(() => !cancelled && setAuthReady(true));
      } else {
        setConnect(true);
        setAuthReady(true);
      }
    }).catch(() => {
      if (cancelled) return;
      setConnect(true);
      setAuthReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (boot.setup?.default_language && !window.localStorage.getItem("daftra-language")) {
      setLanguage(normalizeLanguage(boot.setup.default_language));
    }
    setShowWizard(Boolean(session && boot.setup && !boot.setup.frontend_setup_completed));
  }, [boot.setup, session, setLanguage]);

  useEffect(() => {
    if (activeTab !== "Print Studio" && moduleDocuments.length) {
      setSelectedDocument(moduleDocuments[0]);
    }
  }, [activeTab, moduleDocuments]);

  async function load() {
    try {
      setBoot(await call("daftra.api.business_cycle.get_frontend_boot"));
    } catch (error) {
      pushToast({ type: "error", message: error.message });
      if (String(error.message).toLowerCase().includes("sign")) setConnect(true);
    }
  }

  async function signedIn() {
    const current = await getSession();
    setSession(current);
    setConnect(false);
    await load();
  }

  async function signOut() {
    await logout();
    setSession(null);
    setBoot(DEFAULT_BOOT);
    setConnect(true);
  }

  async function saveSetup(payload) {
    await saveFrontendSetup(payload);
    pushToast({ type: "success", message: t("save_setup") });
    setShowWizard(false);
    await load();
  }

  async function runScenario(key) {
    const methods = { seed: "seed_demo_data", lead_to_cash: "run_sales_cycle", procure_to_stock: "run_purchase_cycle", service_job: "run_service_cycle", validate: "validate_business_cycle" };
    const method = methods[key];
    if (!method) return pushToast("Guided scenario only.");
    try {
      const result = await call(`daftra.api.business_cycle.${method}`, { mutation: key !== "validate" });
      pushToast({ type: "success", message: key === "validate" ? "Business-cycle validation passed." : "Scenario completed successfully." });
      if (key === "service_job") setActiveTab("Bookings");
      await load();
      return result;
    } catch (error) {
      pushToast({ type: "error", message: error.message });
      return null;
    }
  }

  function jumpToWorkspaceDocument(doctype) {
    const target = workspaceCatalog.find((item) => item.doctype === doctype);
    if (!target) return;
    setSelectedDocument(target);
    setActiveTab(target.module);
  }

  if (!authReady) {
    return (
      <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,rgba(135,201,118,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.7),rgba(248,250,248,1))] px-6">
        <div className="flex items-center gap-3 rounded-3xl border border-border/70 bg-card px-6 py-5 shadow-sm">
          <LoaderCircleIcon className="size-5 animate-spin text-primary" />
          <div className="text-sm font-medium text-foreground">{t("loading")}</div>
        </div>
      </div>
    );
  }

  const activeTabLabel = moduleLabel(activeTab, normalizedLanguage);
  const workspaceDocument = activeTab === "Print Studio" ? currentDocument : currentDocument;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(135,201,118,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.7),rgba(248,250,248,1))]">
      <div className="hidden md:fixed md:inset-y-0 md:start-0 md:z-30 md:block md:w-80">
        <AppSidebar navigation={navigation} activeTab={activeTab} onSelect={setActiveTab} language={normalizedLanguage} enabledModules={boot.enabled_modules} companyName={boot.setup?.company_name || session?.user} businessType={boot.setup?.business_type} />
      </div>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-80 border-0 p-0">
          <SheetHeader className="sr-only"><SheetTitle>Navigation</SheetTitle></SheetHeader>
          <AppSidebar navigation={navigation} activeTab={activeTab} onSelect={(next) => { setActiveTab(next); setMobileOpen(false); }} language={normalizedLanguage} enabledModules={boot.enabled_modules} companyName={boot.setup?.company_name || session?.user} businessType={boot.setup?.business_type} />
        </SheetContent>
      </Sheet>

      <div className="md:ps-80">
        <AppHeader activeTab={activeTab} language={normalizedLanguage} t={t} search={search} onSearchChange={setSearch} onToggleLanguage={() => setLanguage((current) => normalizeLanguage(current) === "ar" ? "en" : "ar")} onOpenSetup={() => setShowWizard(true)} onRefresh={load} onOpenMobile={() => setMobileOpen(true)} />
        <main className="px-4 pb-8 pt-6 md:px-8">
          <div className="mb-6 flex items-center justify-end">
            {session ? <Button variant="outline" className="rounded-2xl" onClick={signOut}><LogOutIcon data-icon="inline-start" />{t("sign_out")}</Button> : null}
          </div>
          <ScrollArea className="h-[calc(100vh-9rem)] pe-2">
            <div className="pb-10">
              {activeTab === "Workflow Studio" ? (
                <WorkflowPage boot={boot} t={t} notify={pushToast} onOpenPrintStudio={(doc) => { setSelectedDocument(doc || null); setActiveTab("Print Studio"); }} />
              ) : activeTab === "Print Studio" ? (
                <PrintPage initialDocument={printDocument} t={t} notify={pushToast} onReturn={() => setActiveTab("Sales")} />
              ) : currentDocument ? (
                <div className="grid gap-6">
                  <DashboardPage boot={boot} currencyNode={currencyNode} t={t} activeTabLabel={activeTabLabel} moduleDocuments={moduleDocuments} selectedDocument={currentDocument} onSelectDocument={setSelectedDocument} onOpenPrintStudio={(doc) => { setSelectedDocument(doc || currentDocument); setActiveTab("Print Studio"); }} onRunScenario={runScenario} />
                  <WorkspacePage document={workspaceDocument} t={t} notify={pushToast} onOpenPrintStudio={(doc) => { setSelectedDocument(doc); setActiveTab("Print Studio"); }} onJumpToDocument={jumpToWorkspaceDocument} />
                </div>
              ) : null}
            </div>
          </ScrollArea>
        </main>
      </div>

      <ConnectionDialog open={connect} onClose={() => session && setConnect(false)} onSaved={signedIn} />
      <SetupWizard open={showWizard} setup={boot.setup} t={t} onSave={saveSetup} onClose={() => setShowWizard(false)} />
    </div>
  );
}
