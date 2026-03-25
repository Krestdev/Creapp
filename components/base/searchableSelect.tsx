"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  value?: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  emptyLabel?: string;
  allLabel?: string;
  className?: string;
  width?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Sélectionner...",
  emptyLabel = "Aucun résultat",
  allLabel = "",
  width = "w-full",
  className,
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [triggerWidth, setTriggerWidth] = React.useState<number>(0);

  // Reset search when closed
  React.useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  // Get trigger width when open
  React.useEffect(() => {
    if (open && triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  const selected = options.find((o) => o.value === value);

  // Determine if we should show the "all" option
  const showAllOption = allLabel && allLabel.trim() !== "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            `${width} h-10 justify-between font-normal text-sm font-sans`,
            !selected && "text-muted-foreground",
            className,
          )}
          disabled={disabled}
        >
          <span className="max-w-70 truncate flex-1 text-left">
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        align="start"
        style={{ width: triggerWidth > 0 ? triggerWidth : "auto" }}
      >
        <Command>
          <CommandInput
            placeholder="Rechercher..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>{emptyLabel}</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {showAllOption && (
              <CommandItem
                value={allLabel} 
                onSelect={() => {
                  onChange("all");
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4 shrink-0",
                    value === "all" ? "opacity-100" : "opacity-0",
                  )}
                />
                <span>{allLabel}</span>
              </CommandItem>
            )}

            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.label} 
                onSelect={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4 shrink-0",
                    value === option.value ? "opacity-100" : "opacity-0",
                  )}
                />
                <span>{option.label}</span>
              </CommandItem>
            ))}

            {options.length === 0 && !showAllOption && (
              <CommandItem disabled className="text-muted-foreground">
                {emptyLabel}
              </CommandItem>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
