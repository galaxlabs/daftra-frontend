import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ArrowUpRight,
  BadgeDollarSign,
  Banknote,
  Boxes,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileText,
  Gauge,
  KeyRound,
  Languages,
  LayoutGrid,
  LogOut,
  Menu,
  PackageCheck,
  Play,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import { call, getSession, logout, saveFrontendSetup } from "./lib/api";
import { ConnectionDialog } from "./components/ConnectionDialog";
import { SetupWizard } from "./components/SetupWizard";
import "./styles.css";

const NAV_ICON = {
  Sales: BadgeDollarSign,
  Clients: Users,
  Inventory: Boxes,
  Purchases: ShoppingCart,
  Accounting: Banknote,
  HR: Building2,
  POS: CircleDollarSign,
  Bookings: CalendarDays,
  "Time Tracking": Clock3,
  Tax: ShieldCheck,
  Settings,
  "Print Studio": Printer,
};

const MODULE_LABELS = {
  Sales: { en: "Sales", ar: "المبيعات" },
  Clients: { en: "Clients", ar: "العملاء" },
  Inventory: { en: "Inventory", ar: "المخزون" },
  Purchases: { en: "Purchases", ar: "المشتريات" },
  Accounting: { en: "Accounting", ar: "الحسابات" },
  HR: { en: "HR", ar: "الموارد البشرية" },
  POS: { en: "POS", ar: "نقطة البيع" },
  Bookings: { en: "Bookings", ar: "الحجوزات" },
  "Time Tracking": { en: "Time Tracking", ar: "تتبع الوقت" },
  Tax: { en: "Tax", ar: "الضرائب" },
  Settings: { en: "Settings", ar: "الإعدادات" },
  "Print Studio": { en: "Print Studio", ar: "استوديو الطباعة" },
};

const STRINGS = {
  en: {
    control_center: "Control center",
    documents: "Documents",
    records_and_actions: "Records and actions",
    dashboard: "Dashboard",
    print_studio: "Print Studio",
    sign_in: "Sign in",
    sign_out: "Sign out",
    setup_wizard: "Setup wizard",
    search_workspace: "Search workspace",
    load_demo_company: "Load demo company",
    validate_business_cycle: "Validate business cycle",
    open_workspace: "Open workspace",
    preview_print: "Preview print",
    open_print_studio: "Open Print Studio",
    setup_eyebrow: "First-run setup",
    wizard_title: "Choose your business type",
    wizard_copy: "Set the company profile, language, and module mix before the workspace opens.",
    company_name: "Company name",
    company_placeholder: "Galaxy Labs Trading Co.",
    business_type: "Business type",
    default_language: "Default language",
    default_currency: "Default currency",
    enable_zatca: "Enable ZATCA compliance",
    enable_zatca_copy: "Keep the sales flow ready for Saudi tax reporting.",
    recommended_modules: "Recommended modules",
    services_mode_copy: "Services mode turns on bookings, time tracking, sales, accounting, and tax by default.",
    wizard_recommendation_copy: "The selected business type changes the recommended module mix.",
    services_ready: "Services-ready workspace",
    services_ready_copy: "Use bookings, time entries, recurring billing, and service invoices without leaving the frontend.",
    auto_enabled: "Auto-enabled in this preset",
    later: "Later",
    save_setup: "Save setup",
    saving: "Saving...",
    close: "Close",
    low_stock: "Low stock",
    recent_activity: "Recent activity",
    service_mode: "Services mode",
    service_mode_copy: "This workspace is tuned for bookings, time tracking, billable services, and recurring invoices.",
    service_cycle: "Service cycle",
    service_cycle_copy: "Use the services preset to seed a client, booking, time entry, and service invoice flow.",
    document_catalog: "Printable documents",
    template_coverage: "Template coverage",
    no_document_selected: "Select a document to inspect its print coverage.",
    no_preview: "Choose a template and document, then create a preview.",
    choose_document: "Choose a document",
    choose_template: "Choose a template",
    search_documents: "Search documents",
    revenue: "Revenue",
    outstanding: "Outstanding",
    invoices: "Invoices",
    products: "Products",
    bookings: "Bookings",
    time_entries: "Time entries",
    frontend_only: "Frontend-only navigation",
    frontend_only_copy: "Cards and actions stay in this app. Nothing opens the Frappe Desk.",
    loading: "Loading...",
  },
  ar: {
    control_center: "مركز التحكم",
    documents: "المستندات",
    records_and_actions: "السجلات والإجراءات",
    dashboard: "لوحة التحكم",
    print_studio: "استوديو الطباعة",
    sign_in: "تسجيل الدخول",
    sign_out: "تسجيل الخروج",
    setup_wizard: "معالج الإعداد",
    search_workspace: "بحث داخل مساحة العمل",
    load_demo_company: "تحميل شركة تجريبية",
    validate_business_cycle: "التحقق من دورة الأعمال",
    open_workspace: "فتح مساحة العمل",
    preview_print: "معاينة الطباعة",
    open_print_studio: "فتح استوديو الطباعة",
    setup_eyebrow: "إعداد أول تشغيل",
    wizard_title: "اختر نوع النشاط",
    wizard_copy: "اضبط ملف الشركة واللغة ومجموعة الوحدات قبل فتح مساحة العمل.",
    company_name: "اسم الشركة",
    company_placeholder: "شركة جالاكسي لابس التجارية",
    business_type: "نوع النشاط",
    default_language: "اللغة الافتراضية",
    default_currency: "العملة الافتراضية",
    enable_zatca: "تفعيل توافق ZATCA",
    enable_zatca_copy: "حافظ على دورة المبيعات جاهزة لتقارير الضرائب السعودية.",
    recommended_modules: "الوحدات المقترحة",
    services_mode_copy: "وضع الخدمات يفعّل الحجوزات وتتبع الوقت والفوترة الدورية والضرائب تلقائياً.",
    wizard_recommendation_copy: "نوع النشاط المحدد يغيّر مجموعة الوحدات المقترحة.",
    services_ready: "مساحة عمل جاهزة للخدمات",
    services_ready_copy: "استخدم الحجوزات وساعات العمل والفواتير الدورية من داخل الواجهة فقط.",
    auto_enabled: "مفعّل تلقائياً في هذا الإعداد",
    later: "لاحقاً",
    save_setup: "حفظ الإعداد",
    saving: "جار الحفظ...",
    close: "إغلاق",
    low_stock: "المخزون المنخفض",
    recent_activity: "النشاط الأخير",
    service_mode: "وضع الخدمات",
    service_mode_copy: "تم ضبط هذه المساحة للحجوزات وتتبع الوقت والخدمات القابلة للفوترة والفواتير الدورية.",
    service_cycle: "دورة الخدمات",
    service_cycle_copy: "استخدم إعداد الخدمات لإنشاء عميل وحجز وسجل وقت وفاتورة خدمة تجريبية.",
    document_catalog: "المستندات القابلة للطباعة",
    template_coverage: "تغطية القوالب",
    no_document_selected: "اختر مستنداً لعرض تغطية الطباعة الخاصة به.",
    no_preview: "اختر قالباً ومستنداً ثم أنشئ المعاينة.",
    choose_document: "اختر مستنداً",
    choose_template: "اختر قالباً",
    search_documents: "البحث في المستندات",
    revenue: "الإيراد",
    outstanding: "المستحقات",
    invoices: "الفواتير",
    products: "المنتجات",
    bookings: "الحجوزات",
    time_entries: "ساعات العمل",
    frontend_only: "تنقل داخل الواجهة فقط",
    frontend_only_copy: "البطاقات والإجراءات تبقى داخل هذا التطبيق، ولا تفتح Frappe Desk.",
    loading: "جار التحميل...",
  },
};

const DEFAULT_BOOT = {
  stats: {},
  modules: {},
  enabled_modules: {},
  scenarios: [],
  low_stock: [],
  recent_activity: [],
  setup: {},
  document_catalog: [],
};

function createTranslator(language) {
  const dict = STRINGS[language] || STRINGS.en;
  return (key) => dict[key] || STRINGS.en[key] || key;
}

function moduleLabel(name, language) {
  return MODULE_LABELS[name]?.[language] || MODULE_LABELS[name]?.en || name;
}

function useLocalString(key, fallback) {
  const [value, setValue] = useState(() => window.localStorage.getItem(key) || fallback);
  useEffect(() => {
    window.localStorage.setItem(key, value);
  }, [key, value]);
  return [value, setValue];
}

function normalizeLanguage(value) {
  if (!value) return "en";
  if (value === "ar" || value === "Arabic") return "ar";
  return "en";
}

function formatMoney(value, currency, language) {
  const locale = language === "ar" ? "ar-EG" : "en-US";
  const parts = new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).formatToParts(Number(value || 0));
  return parts.map((part, index) =>
    part.type === "currency" ? (
      <span className="currency-symbol" key={`${part.type}-${index}`}>{part.value}</span>
    ) : (
      <span key={`${part.type}-${index}`}>{part.value}</span>
    )
  );
}

function Currency({ value, currency, language }) {
  return <span className="money">{formatMoney(value, currency, language)}</span>;
}

function StatCard({ label, value, hint, Icon }) {
  return (
    <article className="stat">
      <div>
        <span>{label}</span>
        <Icon />
      </div>
      <strong>{value}</strong>
      <small>{hint}</small>
    </article>
  );
}

function DocumentDrawer({ document, language, t, onPreview, onOpenPrintStudio }) {
  if (!document) {
    return (
      <aside className="detail-panel empty">
        <div className="detail-empty">
          <FileText />
          <strong>{t("no_document_selected")}</strong>
          <span>{t("frontend_only_copy")}</span>
        </div>
      </aside>
    );
  }

  return (
    <aside className="detail-panel">
      <div className="section-head compact">
        <div>
          <span className="eyebrow">{moduleLabel(document.module, language)}</span>
          <h2>{document.doctype}</h2>
        </div>
        <FileText />
      </div>
      <p className="detail-copy">{t("frontend_only_copy")}</p>
      <div className="detail-list">
        <div>
          <span>{t("document_catalog")}</span>
          <strong>{document.module}</strong>
        </div>
        <div>
          <span>{t("template_coverage")}</span>
          <strong>{document.templates.length ? document.templates.join(" · ") : t("no_preview")}</strong>
        </div>
      </div>
      <div className="chip-row">
        {document.templates.length ? document.templates.map((template) => <span className="chip" key={template}>{template}</span>) : <span className="chip muted">{t("no_preview")}</span>}
      </div>
      <div className="detail-actions">
        <button className="secondary" type="button" onClick={() => onPreview(document)}>
          <Printer />
          {t("preview_print")}
        </button>
        <button className="primary" type="button" onClick={() => onOpenPrintStudio(document)}>
          <ArrowUpRight />
          {t("open_print_studio")}
        </button>
      </div>
    </aside>
  );
}

function PrintStudio({ boot, language, t, setNotice, initialDocument, onReturn }) {
  const [data, setData] = useState({ templates: [], documents: [] });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(initialDocument || null);
  const [record, setRecord] = useState("");
  const [options, setOptions] = useState({});
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    call("daftra.api.business_cycle.get_print_studio")
      .then((result) => {
        setData(result);
        const match = initialDocument
          ? result.templates.find((template) => template.doctype === initialDocument.doctype) || result.templates[0]
          : result.templates[0];
        choose(match || null, result.documents, initialDocument || null);
      })
      .catch((error) => setNotice(error.message));
  }, [initialDocument]);

  useEffect(() => {
    if (!selectedDocument && data.documents.length) {
      setSelectedDocument(initialDocument || data.documents[0]);
    }
  }, [data.documents, initialDocument, selectedDocument]);

  function choose(template, documents = data.documents, document = selectedDocument) {
    const nextDocument = document || documents.find((item) => item.doctype === template?.doctype) || documents[0] || null;
    setSelectedTemplate(template || null);
    setSelectedDocument(nextDocument);
    setRecord(template?.records?.[0]?.name || "");
    setOptions(template?.defaults || {});
    setPreview("");
  }

  function chooseDocument(document) {
    setSelectedDocument(document);
    const match = data.templates.find((template) => template.doctype === document.doctype) || data.templates[0] || null;
    choose(match, data.documents, document);
  }

  async function generate() {
    if (!selectedTemplate || !record) {
      setNotice(t("no_preview"));
      return;
    }
    setBusy(true);
    try {
      const result = await call("daftra.api.business_cycle.get_print_preview", {
        mutation: true,
        args: {
          doctype: selectedTemplate.doctype,
          name: record,
          template_key: selectedTemplate.key,
          options,
        },
      });
      setPreview(result.html);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  function printNow() {
    if (!preview) {
      setNotice(t("no_preview"));
      return;
    }
    const popup = window.open("", "_blank", "noopener,noreferrer");
    if (!popup) {
      setNotice("Allow popups to print this document.");
      return;
    }
    popup.document.write(preview);
    popup.document.close();
    popup.focus();
    window.setTimeout(() => popup.print(), 250);
  }

  const filteredDocuments = data.documents.filter((item) =>
    `${item.doctype} ${item.module} ${item.templates.join(" ")}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="print-studio">
      <div className="section-head">
        <div>
          <span className="eyebrow">{t("print_studio")}</span>
          <h2>{t("documents")}</h2>
        </div>
        <div className="print-actions">
          <button className="secondary" onClick={onReturn} type="button">
            <LayoutGrid />
            {t("dashboard")}
          </button>
          <button className="secondary" onClick={generate} disabled={busy || !record} type="button">
            <RefreshCw />
            {busy ? t("saving") : t("preview_print")}
          </button>
          <button className="lime" onClick={printNow} disabled={!preview} type="button">
            <Printer />
            Print
          </button>
        </div>
      </div>

      <div className="service-banner soft">
        <Sparkles />
        <div>
          <strong>{t("document_catalog")}</strong>
          <span>{t("frontend_only_copy")}</span>
        </div>
      </div>

      <div className="template-strip">
        {data.templates.map((template) => (
          <button
            key={template.key}
            className={selectedTemplate?.key === template.key ? "selected" : ""}
            onClick={() => choose(template, data.documents, selectedDocument)}
            type="button"
          >
            <Printer />
            <span>
              <strong>{template.label}</strong>
              <small>{template.description}</small>
            </span>
          </button>
        ))}
      </div>

      <div className="print-catalog-head">
        <label className="search full">
          <Search />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("search_documents")} />
        </label>
        <div className="catalog-meta">
          <span>{filteredDocuments.length} documents</span>
          <span>{data.templates.length} templates</span>
        </div>
      </div>

      <div className="document-catalog">
        {filteredDocuments.map((document) => (
          <button
            key={`${document.module}-${document.doctype}`}
            className={`doc-card ${selectedDocument?.doctype === document.doctype ? "selected" : ""}`}
            type="button"
            onClick={() => chooseDocument(document)}
          >
            <div>
              <span>{moduleLabel(document.module, language)}</span>
              <ArrowUpRight />
            </div>
            <strong>{document.doctype}</strong>
            <small>{document.templates.length ? document.templates.join(" · ") : t("no_preview")}</small>
          </button>
        ))}
      </div>

      <div className="print-workspace">
        <aside className="print-controls">
          <label>
            {t("choose_document")}
            <select
              value={selectedDocument?.doctype || ""}
              onChange={(event) => {
                const doc = data.documents.find((item) => item.doctype === event.target.value);
                if (doc) chooseDocument(doc);
              }}
            >
              <option value="">{t("choose_document")}</option>
              {data.documents.map((item) => (
                <option value={item.doctype} key={item.doctype}>
                  {item.doctype}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("choose_template")}
            <select
              value={selectedTemplate?.key || ""}
              onChange={(event) => {
                const template = data.templates.find((item) => item.key === event.target.value);
                if (template) choose(template, data.documents, selectedDocument);
              }}
            >
              <option value="">{t("choose_template")}</option>
              {data.templates.map((item) => (
                <option value={item.key} key={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend>Print options</legend>
            {Object.entries({ header: "Header", party: "Party", vat: "VAT", qr: "QR", notes: "Notes", signature: "Signature" }).map(([key, label]) => (
              <label className="check-row" key={key}>
                <input
                  type="checkbox"
                  checked={Boolean(options[key])}
                  onChange={(event) => {
                    setOptions({ ...options, [key]: event.target.checked });
                    setPreview("");
                  }}
                />
                <span>
                  <b>{label}</b>
                  <small>{options[key] ? "Included" : "Hidden"}</small>
                </span>
              </label>
            ))}
          </fieldset>
          <p className="helper">{selectedDocument ? `${selectedDocument.doctype} · ${selectedDocument.module}` : t("no_document_selected")}</p>
        </aside>
        <div className="print-preview">
          {preview ? (
            <iframe title="Print preview" srcDoc={preview} />
          ) : (
            <div className="preview-empty">
              <Printer />
              <strong>{t("no_preview")}</strong>
              <span>{selectedTemplate ? selectedTemplate.description : t("choose_template")}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function App() {
  const [boot, setBoot] = useState(DEFAULT_BOOT);
  const [activeTab, setActiveTab] = useState("Sales");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [connect, setConnect] = useState(false);
  const [session, setSession] = useState(null);
  const [mobile, setMobile] = useState(false);
  const [language, setLanguage] = useLocalString("daftra-language", "en");
  const [showWizard, setShowWizard] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const t = useMemo(() => createTranslator(normalizeLanguage(language)), [language]);
  const rtl = normalizeLanguage(language) === "ar";
  const currency = boot.setup?.default_currency || "SAR";
  const serviceMode = boot.setup?.business_type === "Services";

  useEffect(() => {
    document.documentElement.lang = normalizeLanguage(language);
    document.documentElement.dir = rtl ? "rtl" : "ltr";
    document.documentElement.classList.toggle("lang-ar", rtl);
  }, [language, rtl]);

  useEffect(() => {
    getSession()
      .then((current) => {
        setSession(current);
        if (current) {
          load();
        } else {
          setConnect(true);
        }
      })
      .catch(() => setConnect(true));
  }, []);

  useEffect(() => {
    if (boot.setup?.default_language && !window.localStorage.getItem("daftra-language")) {
      setLanguage(normalizeLanguage(boot.setup.default_language));
    }
    setShowWizard(Boolean(session && boot.setup && !boot.setup.frontend_setup_completed));
  }, [boot.setup, session]);

  const moduleNames = useMemo(() => Object.keys(boot.modules || {}), [boot.modules]);
  const activeDocs = useMemo(
    () => (boot.document_catalog || []).filter((item) => item.module === activeTab),
    [boot.document_catalog, activeTab]
  );
  const filteredDocs = useMemo(
    () => activeDocs.filter((item) => `${item.doctype} ${item.templates.join(" ")}`.toLowerCase().includes(search.toLowerCase())),
    [activeDocs, search]
  );
  const printableDocs = useMemo(() => (boot.document_catalog || []).filter((item) => item.templates.length > 0), [boot.document_catalog]);

  useEffect(() => {
    if (activeTab !== "Print Studio" && filteredDocs.length && (!selectedDocument || selectedDocument.module !== activeTab)) {
      setSelectedDocument(filteredDocs[0]);
    }
    if (activeTab !== "Print Studio" && !filteredDocs.length) {
      setSelectedDocument(null);
    }
  }, [activeTab, filteredDocs, selectedDocument]);

  async function load() {
    try {
      setBoot(await call("daftra.api.business_cycle.get_frontend_boot"));
      setNotice("");
    } catch (error) {
      setNotice(error.message);
      if (String(error.message).toLowerCase().includes("sign")) {
        setConnect(true);
      }
    }
  }

  async function signedIn() {
    const current = await getSession();
    setSession(current);
    await load();
  }

  async function signOut() {
    await logout();
    setSession(null);
    setBoot(DEFAULT_BOOT);
    setConnect(true);
    setSelectedDocument(null);
  }

  async function saveSetup(payload) {
    const next = await saveFrontendSetup(payload);
    setBoot((current) => ({ ...current, setup: next }));
    setLanguage(normalizeLanguage(payload.default_language));
    setShowWizard(false);
    setNotice("Setup saved.");
  }

  const run = async (key) => {
    const methods = {
      seed: "seed_demo_data",
      lead_to_cash: "run_sales_cycle",
      procure_to_stock: "run_purchase_cycle",
      service_job: "seed_demo_data",
      validate: "validate_business_cycle",
    };
    if (!methods[key]) return setNotice("This workflow opens as a guided in-app scenario.");
    setBusy(key);
    try {
      const result = await call(`daftra.api.business_cycle.${methods[key]}`, { mutation: key !== "validate" });
      if (key === "service_job") {
        setActiveTab("Bookings");
        setNotice("Service preset loaded for bookings and time tracking.");
      } else if (key === "validate" && result.ok) {
        setNotice("Business-cycle validation passed.");
      } else {
        setNotice("Scenario completed successfully.");
      }
      await load();
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy("");
    }
  };

  const stats = [
    [t("revenue"), <Currency value={boot.stats.total_invoice_amount} currency={currency} language={normalizeLanguage(language)} />, t("frontend_only_copy"), CircleDollarSign],
    [t("low_stock"), boot.low_stock.length || 0, `${boot.low_stock.length} products`, BadgeDollarSign],
    [t("invoices"), boot.stats.total_invoices || 0, "Sales documents", FileText],
    [t("products"), boot.stats.total_products || 0, `${boot.stats.total_stock_value ? "Stock value" : "Inventory"}`, Boxes],
  ];

  if (serviceMode) {
    stats.push(
      [t("bookings"), boot.stats.total_bookings || 0, "Booked sessions", CalendarDays],
      [t("time_entries"), boot.stats.total_time_entries || 0, "Billable hours", Clock3]
    );
  }

  const navigation = [...moduleNames, "Print Studio"];
  const currentDocument = activeTab === "Print Studio" ? selectedDocument : filteredDocs[0] || null;

  return (
    <div className={`app-shell ${rtl ? "rtl" : ""}`}>
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <div className="brand">
          <b>D</b>
          <div>
            <strong>Daftra</strong>
            <span>{serviceMode ? t("service_mode") : t("dashboard")}</span>
          </div>
          <button className="icon mobile-close" onClick={() => setMobile(false)} type="button">
            <X />
          </button>
        </div>
        <nav>
          {navigation.map((name) => {
            const Icon = NAV_ICON[name] || LayoutGrid;
            return (
              <button
                key={name}
                className={activeTab === name ? "active" : ""}
                onClick={() => {
                  setActiveTab(name);
                  setMobile(false);
                  if (name !== "Print Studio") {
                    setSearch("");
                  }
                }}
                type="button"
              >
                <Icon />
                <span>{moduleLabel(name, normalizeLanguage(language))}</span>
                {boot.enabled_modules?.[name] === 0 && <i>Off</i>}
              </button>
            );
          })}
        </nav>
        <div className="side-foot">
          <ShieldCheck />
          <div>
            <strong>{boot.setup?.company_name || session?.user || "Frappe v15"}</strong>
            <span>{boot.setup?.business_type || t("frontend_only")}</span>
          </div>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <button className="icon menu" onClick={() => setMobile(true)} type="button">
            <Menu />
          </button>
          <div>
            <span className="eyebrow">Galaxy Labs / {moduleLabel(activeTab, normalizeLanguage(language))}</span>
            <h1>{activeTab === "Print Studio" ? t("documents") : t("control_center")}</h1>
          </div>
          <div className="top-actions">
            {activeTab !== "Print Studio" && (
              <label className="search">
                <Search />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("search_workspace")}
                />
              </label>
            )}
            <button
              className="icon"
              onClick={() => setLanguage((current) => (normalizeLanguage(current) === "ar" ? "en" : "ar"))}
              title={normalizeLanguage(language) === "ar" ? "English" : "Arabic"}
              type="button"
            >
              <Languages />
            </button>
            <button className="icon" onClick={() => setShowWizard(true)} title={t("setup_wizard")} type="button">
              <Settings />
            </button>
            <button className="icon" onClick={load} title="Refresh" type="button">
              <RefreshCw />
            </button>
            {session ? (
              <button className="secondary" onClick={signOut} type="button">
                <LogOut />
                {t("sign_out")}
              </button>
            ) : (
              <button className="secondary" onClick={() => setConnect(true)} type="button">
                <KeyRound />
                {t("sign_in")}
              </button>
            )}
          </div>
        </header>

        <section className="content">
          {notice && (
            <div className="notice">
              <CheckCircle2 />
              <span>{notice}</span>
              <button className="icon" onClick={() => setNotice("")} type="button">
                <X />
              </button>
            </div>
          )}

          {showWizard && session && (
            <SetupWizard
              open={showWizard}
              setup={boot.setup}
              currencies={boot.setup?.currencies || ["SAR", "AED", "USD", "EUR", "GBP", "PKR"]}
              languages={boot.setup?.languages || [{ value: "en", label: "English" }, { value: "ar", label: "Arabic" }]}
              businessTypes={boot.setup?.business_types || []}
              onClose={() => setShowWizard(false)}
              onSave={saveSetup}
              t={t}
            />
          )}

          {activeTab === "Print Studio" ? (
            <PrintStudio
              boot={boot}
              language={normalizeLanguage(language)}
              t={t}
              setNotice={setNotice}
              initialDocument={currentDocument}
              onReturn={() => setActiveTab(moduleNames[0] || "Sales")}
            />
          ) : (
            <>
              {serviceMode && (
                <section className="service-banner">
                  <Sparkles />
                  <div>
                    <strong>{t("service_mode")}</strong>
                    <span>{t("service_mode_copy")}</span>
                  </div>
                  <div className="service-cta">
                    <button className="secondary" type="button" onClick={() => setActiveTab("Bookings")}>
                      {moduleLabel("Bookings", normalizeLanguage(language))}
                    </button>
                    <button className="secondary" type="button" onClick={() => setActiveTab("Time Tracking")}>
                      {moduleLabel("Time Tracking", normalizeLanguage(language))}
                    </button>
                  </div>
                </section>
              )}

              <div className="stat-grid">
                {stats.map(([label, value, hint, Icon]) => (
                  <StatCard label={label} value={value} hint={hint} Icon={Icon} key={label} />
                ))}
              </div>

              <section className="cycle-panel">
                <div className="section-head">
                  <div>
                    <span className="eyebrow">{serviceMode ? t("service_cycle") : "Executable workflows"}</span>
                    <h2>{serviceMode ? t("service_cycle_copy") : "Business cycle rail"}</h2>
                  </div>
                  <button className="lime" disabled={!!busy} onClick={() => run("seed")} type="button">
                    <PackageCheck />
                    {t("load_demo_company")}
                  </button>
                </div>
                <div className="cycles">
                  {boot.scenarios.map((scenario, index) => (
                    <article className="cycle" key={scenario.key}>
                      <em>0{index + 1}</em>
                      <h3>{scenario.label}</h3>
                      <div className="steps">
                        {scenario.steps.map((step, itemIndex) => (
                          <React.Fragment key={step}>
                            <span>{step}</span>
                            {itemIndex < scenario.steps.length - 1 && <ChevronRight />}
                          </React.Fragment>
                        ))}
                      </div>
                      <button disabled={!!busy} onClick={() => run(scenario.key)} type="button">
                        <Play />
                        {busy === scenario.key ? t("saving") : scenario.key === "lead_to_cash" || scenario.key === "procure_to_stock" ? "Run demo" : t("open_workspace")}
                      </button>
                    </article>
                  ))}
                </div>
              </section>

              <section className="service-banner soft">
                <Sparkles />
                <div>
                  <strong>{t("document_catalog")}</strong>
                  <span>{printableDocs.length} printable documents available in the frontend.</span>
                </div>
                <button className="secondary" type="button" onClick={() => setActiveTab("Print Studio")}>
                  <Printer />
                  {t("open_print_studio")}
                </button>
              </section>

              <div className="work-grid">
                <section className="module-panel">
                  <div className="section-head">
                    <div>
                      <span className="eyebrow">{moduleLabel(activeTab, normalizeLanguage(language))} workspace</span>
                      <h2>{t("records_and_actions")}</h2>
                    </div>
                    <div className="header-badge">{filteredDocs.length} docs</div>
                  </div>
                  <div className="record-grid">
                    {filteredDocs.map((document, index) => {
                      const Icon = NAV_ICON[activeTab] || FileText;
                      return (
                        <article className={`record ${selectedDocument?.doctype === document.doctype ? "selected" : ""}`} key={document.doctype}>
                          <div>
                            <Icon />
                            <span>0{index + 1}</span>
                          </div>
                          <h3>{document.doctype}</h3>
                          <p>{document.templates.length ? document.templates.join(" · ") : "Frontend record view"}</p>
                          <footer>
                            <button className="ghost-link" type="button" onClick={() => setSelectedDocument(document)}>
                              {t("open_workspace")}
                            </button>
                            <div className="record-tools">
                              <button className="icon" type="button" onClick={() => setSelectedDocument(document)}>
                                <FileText />
                              </button>
                              <button className="icon" type="button" onClick={() => {
                                setActiveTab("Print Studio");
                                setSelectedDocument(document);
                              }}>
                                <Printer />
                              </button>
                            </div>
                          </footer>
                        </article>
                      );
                    })}
                  </div>
                </section>
                <DocumentDrawer
                  document={selectedDocument}
                  language={normalizeLanguage(language)}
                  t={t}
                  onPreview={(doc) => {
                    setSelectedDocument(doc);
                    setActiveTab("Print Studio");
                  }}
                  onOpenPrintStudio={(doc) => {
                    setSelectedDocument(doc);
                    setActiveTab("Print Studio");
                  }}
                />
              </div>

              <aside className="insights stacked">
                <section>
                  <div className="section-head compact">
                    <div>
                      <span className="eyebrow">{t("low_stock")}</span>
                      <h2>Inventory signal</h2>
                    </div>
                    <Warehouse />
                  </div>
                  {boot.low_stock.length ? (
                    <div className="signal-list">
                      {boot.low_stock.map((row) => (
                        <div className="signal-row" key={row.name}>
                          <span>
                            <strong>{row.product_name}</strong>
                            <small>{row.product_code}</small>
                          </span>
                          <b>{row.current_stock} / {row.minimum_stock}</b>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty">
                      <PackageCheck />
                      No low-stock alerts
                    </div>
                  )}
                </section>
                <section>
                  <div className="section-head compact">
                    <div>
                      <span className="eyebrow">{t("recent_activity")}</span>
                      <h2>Audit trail</h2>
                    </div>
                    <Activity />
                  </div>
                  <div className="activity-list">
                    {boot.recent_activity.slice(0, 6).map((row) => (
                      <div className="activity-row" key={`${row.doctype}-${row.name}`}>
                        <i />
                        <span>
                          <strong>{row.doctype}</strong>
                          <small>{row.name}</small>
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
                <button className="validate" disabled={!!busy} onClick={() => run("validate")} type="button">
                  <Gauge />
                  {t("validate_business_cycle")}
                </button>
              </aside>
            </>
          )}
        </section>
      </main>

      <ConnectionDialog open={connect} onClose={() => session && setConnect(false)} onSaved={signedIn} />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
