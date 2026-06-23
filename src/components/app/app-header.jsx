import { LanguagesIcon, MenuIcon, RefreshCwIcon, SettingsIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { moduleLabel } from "@/lib/i18n";

export function AppHeader({ activeTab, language, t, search, onSearchChange, onToggleLanguage, onOpenSetup, onRefresh, onOpenMobile }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="flex h-20 items-center gap-3 px-4 md:px-8">
        <Button variant="outline" size="icon" className="rounded-2xl md:hidden" onClick={onOpenMobile}>
          <MenuIcon />
        </Button>
        <div className="grid gap-0.5">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Galaxy Labs / {moduleLabel(activeTab, language)}</span>
          <h1 className="text-xl font-semibold tracking-tight">{activeTab === "Print Studio" ? t("documents") : t("control_center")}</h1>
        </div>
        <div className="ms-auto flex items-center gap-2">
          {activeTab !== "Print Studio" ? <Input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder={t("search_workspace")} className="hidden w-72 rounded-2xl md:flex" /> : null}
          <Button variant="outline" size="icon" className="rounded-2xl" onClick={onToggleLanguage}><LanguagesIcon /></Button>
          <Button variant="outline" size="icon" className="rounded-2xl" onClick={onOpenSetup}><SettingsIcon /></Button>
          <Button variant="outline" size="icon" className="rounded-2xl" onClick={onRefresh}><RefreshCwIcon /></Button>
        </div>
      </div>
    </header>
  );
}
