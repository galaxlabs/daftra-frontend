import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function SearchSelect({ label, placeholder, value, onChange, options = [], className }) {
  const selected = options.find((option) => option.value === value);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label ? <span className="text-xs font-medium text-muted-foreground">{label}</span> : null}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-full justify-between rounded-2xl px-4 py-6 text-start">
            <span className="truncate">{selected?.label || placeholder}</span>
            <ChevronsUpDownIcon className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] rounded-2xl p-0" align="start">
          <Command>
            <CommandInput placeholder={placeholder} />
            <CommandList>
              <CommandEmpty>No result found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem key={option.value} value={`${option.label} ${option.description || ""}`} onSelect={() => onChange(option.value)}>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-sm font-medium">{option.label}</span>
                      {option.description ? <span className="truncate text-xs text-muted-foreground">{option.description}</span> : null}
                    </div>
                    <CheckIcon className={cn("ms-auto", value === option.value ? "opacity-100" : "opacity-0")} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
