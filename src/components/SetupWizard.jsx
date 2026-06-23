import {useEffect, useMemo, useState} from "react";
import {CheckCircle2, Save, Sparkles, X} from "lucide-react";

const MODULE_FIELD_LABELS = [
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

const PRESETS = {
  Services: {
    enable_sales_module: true,
    enable_clients_module: true,
    enable_inventory_module: false,
    enable_purchases_module: false,
    enable_accounting_module: true,
    enable_hr_module: true,
    enable_pos_module: false,
    enable_bookings_module: true,
    enable_time_tracking_module: true,
    enable_tax_module: true,
  },
  Trading: {
    enable_sales_module: true,
    enable_clients_module: true,
    enable_inventory_module: true,
    enable_purchases_module: true,
    enable_accounting_module: true,
    enable_hr_module: false,
    enable_pos_module: true,
    enable_bookings_module: false,
    enable_time_tracking_module: false,
    enable_tax_module: true,
  },
  Retail: {
    enable_sales_module: true,
    enable_clients_module: true,
    enable_inventory_module: true,
    enable_purchases_module: true,
    enable_accounting_module: true,
    enable_hr_module: true,
    enable_pos_module: true,
    enable_bookings_module: false,
    enable_time_tracking_module: false,
    enable_tax_module: true,
  },
  Wholesale: {
    enable_sales_module: true,
    enable_clients_module: true,
    enable_inventory_module: true,
    enable_purchases_module: true,
    enable_accounting_module: true,
    enable_hr_module: false,
    enable_pos_module: false,
    enable_bookings_module: false,
    enable_time_tracking_module: false,
    enable_tax_module: true,
  },
  Mixed: {
    enable_sales_module: true,
    enable_clients_module: true,
    enable_inventory_module: true,
    enable_purchases_module: true,
    enable_accounting_module: true,
    enable_hr_module: true,
    enable_pos_module: true,
    enable_bookings_module: true,
    enable_time_tracking_module: true,
    enable_tax_module: true,
  },
};

function buildForm(setup) {
  return {
    company_name: setup?.company_name || "",
    business_type: setup?.business_type || "Services",
    default_language: setup?.default_language || "English",
    default_currency: setup?.default_currency || "SAR",
    enable_zatca: Boolean(setup?.enable_zatca ?? 1),
    ...PRESETS[setup?.business_type || "Services"],
  };
}

export function SetupWizard({
  open,
  setup,
  currencies,
  businessTypes,
  languages,
  onClose,
  onSave,
  t,
}) {
  const [form, setForm] = useState(buildForm(setup));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(buildForm(setup));
      setError("");
    }
  }, [open, setup]);

  const recommendation = useMemo(() => PRESETS[form.business_type] || PRESETS.Services, [form.business_type]);

  if (!open) return null;

  function updateBusinessType(nextType) {
    setForm((current) => ({
      ...current,
      business_type: nextType,
      ...PRESETS[nextType],
    }));
  }

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

  return (
    <div className="dialog-backdrop wizard-backdrop">
      <form className="wizard" onSubmit={submit}>
        <header className="wizard-head">
          <div>
            <span className="eyebrow">{t("wizard_eyebrow")}</span>
            <h2>{t("wizard_title")}</h2>
            <p>{t("wizard_copy")}</p>
          </div>
          <button type="button" className="icon" onClick={onClose} aria-label={t("close")}>
            <X />
          </button>
        </header>

        {error && <div className="form-error">{error}</div>}

        <div className="wizard-grid">
          <section>
            <label>
              {t("company_name")}
              <input
                value={form.company_name}
                onChange={(event) => setForm({ ...form, company_name: event.target.value })}
                placeholder={t("company_placeholder")}
              />
            </label>

            <label>
              {t("business_type")}
              <select value={form.business_type} onChange={(event) => updateBusinessType(event.target.value)}>
                {businessTypes.map((type) => (
                  <option value={type.value} key={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              {t("default_language")}
              <select value={form.default_language} onChange={(event) => setForm({ ...form, default_language: event.target.value })}>
                {languages.map((language) => (
                  <option value={language.label} key={language.value}>
                    {language.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              {t("default_currency")}
              <select value={form.default_currency} onChange={(event) => setForm({ ...form, default_currency: event.target.value })}>
                {currencies.map((currency) => (
                  <option value={currency} key={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </label>

            <label className="check-row wizard-check">
              <input
                type="checkbox"
                checked={form.enable_zatca}
                onChange={(event) => setForm({ ...form, enable_zatca: event.target.checked })}
              />
              <span>
                <b>{t("enable_zatca")}</b>
                <small>{t("enable_zatca_copy")}</small>
              </span>
            </label>
          </section>

          <aside className="wizard-side">
            <div className="wizard-summary">
              <Sparkles />
              <div>
                <strong>{t("recommended_modules")}</strong>
                <span>{t(form.business_type === "Services" ? "services_mode_copy" : "wizard_recommendation_copy")}</span>
              </div>
            </div>

            <div className="wizard-pills">
              {MODULE_FIELD_LABELS.map(([field, label]) => (
                <label className={`pill ${form[field] ? "on" : ""}`} key={field}>
                  <input
                    type="checkbox"
                    checked={Boolean(form[field])}
                    onChange={(event) => setForm({ ...form, [field]: event.target.checked })}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            <div className="wizard-note">
              <CheckCircle2 />
              <div>
                <strong>{t("services_ready")}</strong>
                <span>{t("services_ready_copy")}</span>
              </div>
            </div>

            <div className="wizard-recap">
              <strong>{t("auto_enabled")}</strong>
              <div>{Object.entries(recommendation).filter(([, enabled]) => enabled).map(([field]) => field.replace("enable_", "").replace("_module", "").replaceAll("_", " ")).join(" · ")}</div>
            </div>
          </aside>
        </div>

        <footer className="wizard-actions">
          <button type="button" className="secondary" onClick={onClose}>
            {t("later")}
          </button>
          <button className="primary" type="submit" disabled={busy}>
            <Save />
            {busy ? t("saving") : t("save_setup")}
          </button>
        </footer>
      </form>
    </div>
  );
}
