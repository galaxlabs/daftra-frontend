import {
  BadgeDollarSign,
  Banknote,
  Boxes,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  FileText,
  Gauge,
  LayoutGrid,
  Printer,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Users,
  Building2,
  BriefcaseBusiness,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { moduleLabel } from "@/lib/i18n";

const icons = {
  Sales: BadgeDollarSign,
  Clients: Users,
  Inventory: Boxes,
  Purchases: ShoppingCart,
  Accounting: Banknote,
  HR: Building2,
  POS: CircleDollarSign,
  Bookings: CalendarDays,
  "Time Tracking": Clock3,
  Projects: BriefcaseBusiness,
  Tax: ShieldCheck,
  Settings,
  "Print Studio": Printer,
  "Workflow Studio": Gauge,
};

export function AppSidebar({ navigation, activeTab, onSelect, language, enabledModules, companyName, businessType }) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <div className="grid size-12 place-items-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">D</div>
        <div className="grid gap-0.5">
          <strong className="text-base font-semibold">Daftra</strong>
          <span className="text-xs text-sidebar-foreground/70">Galaxy Labs Clone</span>
        </div>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="grid gap-1">
          {navigation.map((name) => {
            const Icon = icons[name] || LayoutGrid;
            const isActive = activeTab === name;
            return (
              <Button
                key={name}
                variant={isActive ? "secondary" : "ghost"}
                className={cn("h-12 justify-start gap-3 rounded-2xl px-4", !isActive && "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}
                onClick={() => onSelect(name)}
              >
                <Icon data-icon="inline-start" />
                <span className="flex-1 truncate text-sm">{moduleLabel(name, language)}</span>
                {enabledModules?.[name] === 0 ? <Badge variant="outline">Off</Badge> : null}
              </Button>
            );
          })}
        </div>
      </ScrollArea>
      <div className="border-t border-sidebar-border px-5 py-4">
        <div className="rounded-2xl bg-sidebar-accent px-4 py-3">
          <div className="truncate text-sm font-medium">{companyName || "Daftra ERP"}</div>
          <div className="truncate text-xs text-sidebar-foreground/70">{businessType || "Frontend-only navigation"}</div>
        </div>
      </div>
    </div>
  );
}
