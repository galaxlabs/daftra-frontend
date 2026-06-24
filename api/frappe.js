const ALLOWED = new Set([
  "daftra.api.business_cycle.create_frontend_workspace_record",
  "daftra.api.business_cycle.get_frontend_boot",
  "daftra.api.business_cycle.get_frontend_record",
  "daftra.api.business_cycle.get_frontend_workspace",
  "daftra.api.business_cycle.get_low_stock",
  "daftra.api.business_cycle.get_print_preview",
  "daftra.api.business_cycle.get_print_studio",
  "daftra.api.business_cycle.get_recent_activity",
  "daftra.api.business_cycle.get_service_cycle_context",
  "daftra.api.business_cycle.run_purchase_cycle",
  "daftra.api.business_cycle.run_sales_cycle",
  "daftra.api.business_cycle.run_service_cycle",
  "daftra.api.business_cycle.seed_demo_data",
  "daftra.api.business_cycle.validate_business_cycle",
  "daftra.api.dashboard_api.save_frontend_setup",
  "daftra.api.sales_api.get_client_profile",
  "daftra.api.sales_api.get_product_profile",
  "daftra.api.sales_api.get_sales_workflow_context",
  "daftra.api.sales_api.get_workflow_catalog",
  "daftra.api.sales_api.validate_sales_invoice_payload",
  "daftra.api.zatca_api.get_zatca_qr",
  "daftra.api.zatca_api.validate_zatca_invoice",
]);

function getCookie(req, name) {
  const match = (req.headers.cookie || "").match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function setSessionCookie(res, sid, maxAge = 604800) {
  res.setHeader(
    "Set-Cookie",
    `daftra_sid=${encodeURIComponent(sid)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`
  );
}

async function auth(req, res, backend) {
  if (req.method === "POST") {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const upstream = await fetch(`${backend}/api/method/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({ usr: username, pwd: password }).toString(),
    });

    const data = await upstream.json();
    const sid = (upstream.headers.get("set-cookie") || "").match(/(?:^|,\s*)sid=([^;]+)/)?.[1];

    if (!upstream.ok || !sid) {
      return res.status(401).json({ message: data.message || "Invalid login" });
    }

    setSessionCookie(res, sid);
    return res.status(200).json({ message: { full_name: data.full_name || username } });
  }

  const sid = getCookie(req, "daftra_sid");

  if (req.method === "DELETE") {
    if (sid) {
      await fetch(`${backend}/api/method/logout`, {
        method: "POST",
        headers: { Cookie: `sid=${sid}` },
      });
    }
    setSessionCookie(res, "", 0);
    return res.status(200).json({ message: true });
  }

  if (!sid) {
    return res.status(401).json({ message: "Not signed in" });
  }

  const upstream = await fetch(`${backend}/api/method/frappe.auth.get_logged_user`, {
    headers: {
      Cookie: `sid=${sid}`,
      Accept: "application/json",
    },
  });

  if (!upstream.ok) {
    setSessionCookie(res, "", 0);
    return res.status(401).json({ message: "Session expired" });
  }

  const data = await upstream.json();
  return res.status(200).json({ message: { user: data.message } });
}

export default async function handler(req, res) {
  const method = String(req.query.method || "");
  const backend = (process.env.DAFTRA_BACKEND_URL || "https://daftra.galaxylabs.online").replace(/\/$/, "");

  if (method === "__auth") {
    return auth(req, res, backend);
  }

  if (!ALLOWED.has(method)) {
    return res.status(403).json({ message: "Method not allowed" });
  }

  const sid = getCookie(req, "daftra_sid");
  if (!sid) {
    return res.status(401).json({ message: "Please sign in" });
  }

  try {
    const upstream = await fetch(`${backend}/api/method/${method}`, {
      method: req.method === "POST" ? "POST" : "GET",
      headers: {
        Cookie: `sid=${sid}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: req.method === "POST" ? JSON.stringify(req.body || {}) : undefined,
    });

    const text = await upstream.text();
    res
      .status(upstream.status)
      .setHeader("Content-Type", upstream.headers.get("content-type") || "application/json")
      .send(text);
  } catch (error) {
    res.status(502).json({ message: "Backend unavailable", detail: error.message });
  }
}
