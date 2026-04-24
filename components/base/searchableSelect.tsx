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
  CommandList,
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
  const listRef = React.useRef<HTMLDivElement>(null);

  // Resize dynamique
  React.useEffect(() => {
    if (!triggerRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      setTriggerWidth(entry.contentRect.width);
    });

    observer.observe(triggerRef.current);

    return () => observer.disconnect();
  }, []);

  // Reset search quand on ferme
  React.useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  // Scroll automatique vers le haut quand on ouvre
  React.useEffect(() => {
    if (open && listRef.current) {
      // Petit délai pour que le DOM soit prêt
      setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollTop = 0;
        }
      }, 0);
    }
  }, [open]);

  // Option "all"
  const showAllOption = allLabel && allLabel.trim() !== "";

  // Selected
  const selected =
    value === "all"
      ? { value: "all", label: allLabel }
      : options.find((o) => o.value === value);

  // Filtrer les options
  const filteredOptions = React.useMemo(() => {
    if (!search) return options;

    const searchLower = search.toLowerCase().trim();
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchLower),
    );
  }, [options, search]);

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
          <span className="max-w-[280px] truncate flex-1 text-left">
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="p-0"
        align="start"
        style={{ width: triggerWidth || "auto" }}
      >
        <Command shouldFilter={false} className="overflow-hidden">
          <CommandInput
            placeholder="Rechercher..."
            value={search}
            onValueChange={setSearch}
          />

          {/* Ajout de onWheel pour permettre le scroll avec la molette */}
          <div
            ref={listRef}
            className="max-h-[300px] overflow-y-auto"
            onWheel={(e) => {
              // Permet le scroll même si la molette est utilisée ailleurs
              e.stopPropagation();
            }}
          >
            <CommandList className="h-full">
              <CommandEmpty>{emptyLabel}</CommandEmpty>

              <CommandGroup>
                {/* Option ALL - uniquement si pas de recherche */}
                {showAllOption && !search && (
                  <CommandItem
                    value="all"
                    onSelect={() => {
                      onChange("all");
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === "all" ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {allLabel}
                  </CommandItem>
                )}

                {/* Options filtrées */}
                {filteredOptions.map((option) => (
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
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
