"use client";

import { FilterSearch } from "@/components/ds/filter-bar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerEyebrow,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, getUserName } from "@/lib/utils";
import { Category, RequestModelT, User } from "@/types/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import * as React from "react";

interface BesoinsPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requests: Array<RequestModelT>;
  categories: Array<Category>;
  users: Array<User>;
  /** Besoins déjà inclus dans la demande. */
  selectedIds: number[];
  onConfirm: (ids: number[]) => void;
}

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/**
 * Tiroir « Sélection des besoins » (Figma · Créer une demande de cotation) :
 * recherche, filtre par catégorie, liste à cocher. Rien n'est appliqué à la
 * demande avant « Continuer ».
 */
export function BesoinsPicker({
  open,
  onOpenChange,
  requests,
  categories,
  users,
  selectedIds,
  onConfirm,
}: BesoinsPickerProps) {
  const [draft, setDraft] = React.useState<number[]>(selectedIds);
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("all");

  // À chaque ouverture : on repart de la sélection de la demande.
  React.useEffect(() => {
    if (open) {
      setDraft(selectedIds);
      setSearch("");
      setCategory("all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const categoryLabel = React.useCallback(
    (id?: number) => categories.find((c) => c.id === id)?.label,
    [categories],
  );

  const categoryOptions = React.useMemo(() => {
    const ids = [
      ...new Set(
        requests
          .map((r) => r.categoryId)
          .filter((id): id is number => id !== undefined),
      ),
    ];
    return ids.map((id) => ({
      value: String(id),
      label: categoryLabel(id) ?? `Catégorie ${id}`,
    }));
  }, [requests, categoryLabel]);

  const visible = React.useMemo(() => {
    const query = normalize(search.trim());
    return requests.filter((r) => {
      if (category !== "all" && String(r.categoryId) !== category) return false;
      if (!query) return true;
      return [r.ref, r.label, getUserName(users, r.userId) ?? ""].some((v) =>
        normalize(v).includes(query),
      );
    });
  }, [requests, users, search, category]);

  const toggle = (id: number, checked: boolean) =>
    setDraft((prev) =>
      checked ? [...new Set([...prev, id])] : prev.filter((x) => x !== id),
    );

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerEyebrow>{"Sélection des besoins"}</DrawerEyebrow>
          <DrawerTitle>{"Nouvelle demande de cotation"}</DrawerTitle>
          <DrawerDescription>
            {"Choisissez les besoins approuvés à regrouper dans cette demande."}
          </DrawerDescription>
        </DrawerHeader>

        <DrawerBody className="flex flex-col gap-3">
          <div className="flex items-end gap-2.5">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Label>{"Rechercher"}</Label>
              <FilterSearch
                value={search}
                onChange={setSearch}
                placeholder="Référence, objet, demandeur…"
                className="h-9 sm:w-full"
              />
            </div>
            <div className="flex w-[200px] shrink-0 flex-col gap-1.5">
              <Label>{"Catégorie"}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{"Toutes les catégories"}</SelectItem>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {visible.length === 0 ? (
            <p className="rounded-lg border border-border-default px-4 py-8 text-center text-body text-text-secondary">
              {"Aucun besoin à afficher."}
            </p>
          ) : (
            <ul className="overflow-hidden rounded-lg border border-border-default">
              {visible.map((r, index) => {
                const checked = draft.includes(r.id);
                const requester = getUserName(users, r.userId);
                return (
                  <li
                    key={r.id}
                    className={cn(
                      index > 0 && "border-t border-border-default",
                      checked && "bg-brand-subtle",
                    )}
                  >
                    {/* Pas de <label> : le bouton de la case recevrait deux clics. */}
                    <div
                      onClick={() => toggle(r.id, !checked)}
                      className="flex cursor-pointer items-start gap-3 px-3.5 py-3"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => toggle(r.id, value === true)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Inclure ${r.ref}`}
                        className="mt-0.5"
                      />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="text-caption text-brand">
                          {r.ref}
                        </span>
                        <span className="text-body-strong text-text-primary">
                          {r.label}
                        </span>
                        <span className="text-caption text-text-tertiary">
                          {[
                            requester,
                            r.dueDate
                              ? `souhaité le ${format(
                                  new Date(r.dueDate),
                                  "d MMMM yyyy",
                                  { locale: fr },
                                )}`
                              : undefined,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                        <span className="text-caption text-text-secondary">
                          {[`${r.quantity} ${r.unit}`, categoryLabel(r.categoryId)]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </DrawerBody>

        <DrawerFooter pinned className="sm:justify-end">
          <p className="mr-auto text-body-medium text-text-primary">
            {`${draft.length} besoin${draft.length > 1 ? "s" : ""}`}
          </p>
          <DrawerClose asChild>
            <Button type="button" variant="outline">
              {"Annuler"}
            </Button>
          </DrawerClose>
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              onConfirm(draft);
              onOpenChange(false);
            }}
          >
            {"Continuer"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
