const DEFAULT_BACKEND = "https://daftra.galaxylabs.online";

async function parse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.exc) {
    throw new Error(data.message || data.exception || "Request failed");
  }
  return data.message ?? data;
}

export async function login({ username, password }) {
  return parse(
    await fetch("/api/frappe?method=__auth", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
  );
}

export async function logout() {
  return parse(
    await fetch("/api/frappe?method=__auth", {
      method: "DELETE",
      credentials: "include",
    })
  );
}

export async function getSession() {
  const response = await fetch("/api/frappe?method=__auth", { credentials: "include" });
  if (response.status === 401) return null;
  return parse(response);
}

export async function call(method, { mutation = false, args = {} } = {}) {
  return parse(
    await fetch(`/api/frappe?method=${encodeURIComponent(method)}`, {
      method: mutation ? "POST" : "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: mutation ? JSON.stringify(args) : undefined,
    })
  );
}

export async function saveFrontendSetup(payload) {
  return call("daftra.api.dashboard_api.save_frontend_setup", { mutation: true, args: payload });
}

export function docRoute(doctype, name = "") {
  const slug = doctype.toLowerCase().replaceAll(" ", "-");
  return `#/doc/${slug}${name ? `/${encodeURIComponent(name)}` : ""}`;
}

export function deskUrl(doctype, name = "") {
  return docRoute(doctype, name);
}

export function deskBase() {
  return import.meta.env.VITE_DAFTRA_DESK_URL || DEFAULT_BACKEND;
}
