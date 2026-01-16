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
  allLabel = "Tous",
  width = "w-fit",
  className,
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [contentWidth, setContentWidth] = React.useState<number>(0);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // 🔁 Reset automatique de la recherche à la fermeture
  const [search, setSearch] = React.useState("");
  React.useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  // Mettre à jour la largeur du contenu quand il change
  React.useEffect(() => {
    if (open && contentRef.current) {
      // Attendre un tick pour que le contenu soit rendu
      setTimeout(() => {
        if (contentRef.current) {
          const width = contentRef.current.offsetWidth;
          setContentWidth(width);
        }
      }, 0);
    }
  }, [open, options, search]);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="inline-block">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              `${width} h-10 justify-between`,
              !selected && "text-muted-foreground",
              className
            )}
            disabled={disabled}
          >
            <span className="truncate flex-1 text-left max-w-[270px]">
              {selected ? selected.label : placeholder}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 w-auto"
          align="start"
          ref={contentRef}
        >
          <Command className="w-[350px]">
            <CommandInput
              placeholder="Rechercher..."
              value={search}
              onValueChange={setSearch}
              className="w-full"
            />

            <CommandEmpty>{emptyLabel}</CommandEmpty>

            <CommandGroup className="w-full max-h-[300px] overflow-y-auto">
              {/* Option ALL */}
              {allLabel && (
                <CommandItem
                  value="all"
                  onSelect={() => {
                    onChange("all");
                    setOpen(false);
                  }}
                  className="w-full"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === "all" ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{allLabel}</span>
                </CommandItem>
              )}

              {options
                .filter((option) =>
                  option.label.toLowerCase().includes(search.toLowerCase())
                )
                .map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className="w-full"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        value === option.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}