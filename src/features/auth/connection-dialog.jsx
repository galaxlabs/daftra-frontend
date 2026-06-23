import { useState } from "react";
import { LogInIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/api";

export function ConnectionDialog({ open, onClose, onSaved }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(form);
      setForm({ username: "", password: "" });
      await onSaved();
      onClose();
    } catch (loginError) {
      setError(loginError.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && !next ? onClose() : null}>
      <DialogContent className="max-w-md rounded-3xl border-0 bg-card p-0 shadow-2xl">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Sign in to Daftra</DialogTitle>
          <DialogDescription>Your password is sent to Frappe for login and is never stored by this app.</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4 px-6 pb-6" onSubmit={submit}>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Email or username
            <Input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required autoComplete="username" className="rounded-2xl" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Password
            <Input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required autoComplete="current-password" className="rounded-2xl" />
          </label>
          {error ? <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}
          <Button type="submit" size="lg" className="rounded-2xl" disabled={busy}>
            <LogInIcon data-icon="inline-start" />
            {busy ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
