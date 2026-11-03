"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, getUserName } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { commandRqstQ } from "@/queries/commandRqstModule";
import { Category, CommandRequestT, RequestModelT, User } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, PlusIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SearchableSelect } from "../base/searchableSelect";
import { DetailOrder } from "../modals/detail-order";
import { BesoinsPicker } from "./besoins-picker";

const formSchema = z.object({
  name: z.string().min(1, "Le nom est obligatoire"),
  // telephone qui doit etre uniquement les chiffres
  telephone: z
    .string()
    .min(1, "Le numéro de téléphone est obligatoire")
    .refine((val) => !isNaN(Number(val)), {
      message: "Le numéro de téléphone doit contenir uniquement des chiffres",
    }),
  titre: z.string().min(1, "Le titre est obligatoire"),
  date_limite: z.coerce.date(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  requests: Array<RequestModelT>;
  users: User[];
  categories: Array<Category>;
}

const LIST_HREF = "/tableau-de-bord/commande/cotation";

function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col rounded-xl border border-border-default bg-surface",
        className,
      )}
    >
      {children}
    </section>
  );
}

/**
 * Aperçu en direct du PDF envoyé aux fournisseurs (`DétailCotation.tsx`) : même
 * papier à en-tête, mêmes blocs, mêmes proportions. Les mesures du PDF sont en
 * points sur une page A4 de 595 pt de large ; `pt()` les convertit en unités
 * de conteneur pour que l'aperçu suive la largeur disponible.
 */
const PAGE_WIDTH_PT = 595;
const pt = (value: number) => `${((value / PAGE_WIDTH_PT) * 100).toFixed(3)}cqw`;
/** Lignes du tableau montrables sur la première page ; le PDF continue ensuite. */
const PREVIEW_ROWS = 5;

function DocumentPreview({
  values,
  needs,
}: {
  values: Partial<FormValues>;
  needs: RequestModelT[];
}) {
  const today = new Date();
  const deadline = values.date_limite
    ? format(new Date(values.date_limite), "PPP", { locale: fr })
    : "-";
  const shown = needs.slice(0, PREVIEW_ROWS);
  const meta: Array<[string, string]> = [
    ["Objet", values.titre || "-"],
    ["Référence", "Attribuée à la création"],
    ["Date limite de soumission", deadline],
    ["Contact principal", values.name || "-"],
    ["Téléphone", values.telephone || "-"],
    ["Date de création", format(today, "PPP", { locale: fr })],
  ];
  const columns = [
    { label: "Besoin", width: "26%" },
    { label: "Description détaillée", width: "46%" },
    { label: "Unité", width: "13%" },
    { label: "Quantité", width: "15%" },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex items-center">
        <p className="flex-1 text-title text-text-primary">
          {"Aperçu du document"}
        </p>
        <p className="text-caption text-text-tertiary">
          {"Mis à jour en direct"}
        </p>
      </div>

      <div
        className="relative w-full overflow-hidden border border-border-default bg-white shadow-[0px_2px_4px_-2px_rgba(16,24,40,0.04),0px_4px_12px_-2px_rgba(16,24,40,0.08)] [container-type:inline-size]"
        style={{
          aspectRatio: "595 / 842",
          fontFamily: "Helvetica, Arial, sans-serif",
          fontSize: pt(10),
          color: "#111827",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/crea.jpg"
          alt=""
          className="absolute inset-0 size-full"
        />

        <div
          className="relative"
          style={{
            paddingTop: pt(110),
            paddingBottom: pt(90),
            paddingInline: pt(34),
          }}
        >
          <div style={{ marginBottom: pt(18) }}>
            <p
              style={{
                fontSize: pt(9),
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: pt(1.2),
                marginBottom: pt(4),
              }}
            >
              {"Consultation fournisseurs"}
            </p>
            <p
              style={{
                fontSize: pt(20),
                fontWeight: 700,
                color: "#700032",
                marginBottom: pt(6),
              }}
            >
              {"Demande de cotation"}
            </p>
            <p
              style={{
                fontSize: pt(10),
                lineHeight: 1.5,
                color: "#4B5563",
                maxWidth: "88%",
              }}
            >
              {"Merci de bien vouloir nous transmettre votre meilleure offre pour les éléments ci-dessous, dans le respect des spécifications indiquées."}
            </p>
          </div>

          <div
            style={{
              border: "1px solid #E5E7EB",
              backgroundColor: "#FAFAFA",
              borderRadius: pt(6),
              padding: pt(14),
              marginBottom: pt(20),
              display: "flex",
              flexWrap: "wrap",
              rowGap: pt(10),
            }}
          >
            {meta.map(([label, value]) => (
              <div
                key={label}
                style={{ width: "50%", paddingRight: pt(12), minWidth: 0 }}
              >
                <p
                  style={{
                    fontSize: pt(8),
                    color: "#6B7280",
                    textTransform: "uppercase",
                    marginBottom: pt(2),
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    fontSize: pt(10),
                    fontWeight: 500,
                    lineHeight: 1.4,
                    overflowWrap: "anywhere",
                  }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: pt(8),
              marginBottom: pt(10),
            }}
          >
            <div
              style={{
                width: pt(4),
                height: pt(14),
                backgroundColor: "#700032",
              }}
            />
            <p style={{ fontSize: pt(13), fontWeight: 600 }}>
              {"Éléments demandés"}
            </p>
          </div>

          <div
            style={{
              border: "1px solid #D1D5DB",
              backgroundColor: "#FFFFFF",
              marginBottom: pt(18),
            }}
          >
            <div
              style={{
                display: "flex",
                backgroundColor: "#F3F4F6",
                borderBottom: "1px solid #D1D5DB",
                minHeight: pt(38),
              }}
            >
              {columns.map((col, i) => (
                <div
                  key={col.label}
                  style={{
                    width: col.width,
                    padding: `${pt(9)} ${pt(8)}`,
                    display: "flex",
                    alignItems: "center",
                    borderRight:
                      i < columns.length - 1 ? "1px solid #D1D5DB" : undefined,
                  }}
                >
                  <p
                    style={{
                      fontSize: pt(9),
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "#374151",
                      lineHeight: 1.25,
                    }}
                  >
                    {col.label}
                  </p>
                </div>
              ))}
            </div>

            {shown.length === 0 ? (
              <p
                style={{
                  padding: `${pt(14)} ${pt(8)}`,
                  color: "#6B7280",
                  fontSize: pt(10),
                }}
              >
                {"Aucun besoin sélectionné."}
              </p>
            ) : (
              shown.map((need, index) => (
                <div
                  key={need.id}
                  style={{
                    display: "flex",
                    minHeight: pt(42),
                    backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#FCFCFD",
                    borderBottom:
                      index < shown.length - 1 ? "1px solid #E5E7EB" : undefined,
                  }}
                >
                  {[
                    {
                      text: need.label || "-",
                      style: { fontWeight: 600, color: "#111827" },
                    },
                    {
                      text: need.description || "-",
                      style: { color: "#374151" },
                    },
                    { text: need.unit || "-", style: { color: "#374151" } },
                    {
                      text:
                        need.quantity !== undefined && need.quantity !== null
                          ? String(need.quantity)
                          : "-",
                      style: {
                        fontWeight: 600,
                        color: "#111827",
                        textAlign: "right" as const,
                      },
                    },
                  ].map((cell, i) => (
                    <div
                      key={i}
                      style={{
                        width: columns[i].width,
                        padding: `${pt(9)} ${pt(8)}`,
                        minWidth: 0,
                        borderRight:
                          i < columns.length - 1
                            ? "1px solid #E5E7EB"
                            : undefined,
                      }}
                    >
                      <p
                        style={{
                          fontSize: pt(10),
                          lineHeight: 1.45,
                          overflowWrap: "anywhere",
                          ...cell.style,
                        }}
                      >
                        {cell.text}
                      </p>
                    </div>
                  ))}
                </div>
              ))
            )}
            {needs.length > shown.length && (
              <p
                style={{
                  padding: `${pt(6)} ${pt(8)}`,
                  borderTop: "1px solid #E5E7EB",
                  fontSize: pt(9),
                  color: "#6B7280",
                }}
              >
                {`+ ${needs.length - shown.length} autre${
                  needs.length - shown.length > 1 ? "s" : ""
                } ligne${needs.length - shown.length > 1 ? "s" : ""} (page suivante)`}
              </p>
            )}
          </div>

          <div
            style={{
              border: "1px solid #E5E7EB",
              backgroundColor: "#FAFAFA",
              borderRadius: pt(6),
              padding: pt(12),
            }}
          >
            <p
              style={{
                fontSize: pt(10),
                fontWeight: 600,
                marginBottom: pt(4),
              }}
            >
              {"Consignes"}
            </p>
            <p style={{ fontSize: pt(9), lineHeight: 1.5, color: "#4B5563" }}>
              {"Veuillez préciser pour chaque ligne votre conformité aux spécifications demandées, ainsi que toute observation utile liée à la disponibilité, au délai, à la garantie ou aux conditions particulières."}
            </p>
          </div>
        </div>

        <div
          className="absolute flex items-center justify-between"
          style={{
            bottom: pt(92),
            left: pt(60),
            right: pt(60),
            fontSize: pt(9),
            color: "#6B7280",
          }}
        >
          <span style={{ width: "33%" }}>
            {`Créé le ${format(today, "PPP", { locale: fr })}`}
          </span>
          <span style={{ width: "34%", textAlign: "center" }}>
            {"Page 1 / 1"}
          </span>
          <span style={{ width: "33%", textAlign: "right" }}>
            {"Document généré automatiquement"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CreateCotation({ requests, users, categories }: Props) {
  const router = useRouter();
  const { user } = useStore();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<RequestModelT[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [needsError, setNeedsError] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [created, setCreated] = useState<CommandRequestT | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      telephone: "",
      titre: "",
      date_limite: new Date(),
    },
  });

  const createCommand = useMutation({
    mutationFn: (
      data: Omit<
        CommandRequestT,
        "id" | "createdAt" | "updatedAt" | "reference" | "besoins"
      >,
    ) => commandRqstQ.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries();
      setCreated(res.data);
      setSuccessOpen(true);
      form.reset();
      setSelected([]);
    },
    onError: () => {
      toast.error(
        "Une erreur est survenue lors de la création de la cotation.",
      );
    },
  });

  function onSubmit(values: FormValues) {
    if (selected.length === 0) {
      setNeedsError(true);
      toast.error("Veuillez choisir au moins un besoin.");
      return;
    }
    createCommand.mutate({
      name: values.name,
      phone: values.telephone,
      title: values.titre,
      requests: selected.map((item) => item.id),
      dueDate: values.date_limite,
      userId: Number(user?.id),
      deliveryDate: new Date(),
    });
  }

  const categoryLabel = (id?: number) =>
    categories.find((c) => c.id === id)?.label;

  const confirmNeeds = (ids: number[]) => {
    // L'ordre de la liste des besoins reste celui du choix de l'utilisateur.
    const kept = selected.filter((n) => ids.includes(n.id));
    const added = ids
      .filter((id) => !kept.some((n) => n.id === id))
      .map((id) => requests.find((r) => r.id === id))
      .filter((r): r is RequestModelT => r !== undefined);
    setSelected([...kept, ...added]);
    setNeedsError(false);
  };

  // eslint-disable-next-line react-hooks/incompatible-library
  const watched = form.watch();

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-5 @min-[1024px]:flex-row @min-[1024px]:items-start">
            <div className="flex min-w-0 flex-1 flex-col gap-5">
              {/* Besoins inclus */}
              <Card
                className={cn(
                  "px-5 pt-4 pb-3",
                  needsError && "border-status-danger-fg",
                )}
              >
                <div className="flex items-center gap-2 pb-2.5">
                  <h2 className="flex-1 text-title text-text-primary">
                    {`Besoins inclus · ${selected.length}`}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="flex cursor-pointer items-center gap-1.5 rounded-xs text-body-medium text-text-link outline-none hover:underline focus-visible:shadow-focus-ring"
                  >
                    <PlusIcon aria-hidden className="size-4" />
                    {"Ajouter des besoins"}
                  </button>
                </div>
                {selected.length === 0 ? (
                  <p
                    className={cn(
                      "border-t border-border-default py-4 text-body",
                      needsError
                        ? "text-status-danger-fg"
                        : "text-text-secondary",
                    )}
                  >
                    {"Aucun besoin sélectionné. Choisissez au moins un besoin à regrouper dans la demande."}
                  </p>
                ) : (
                  selected.map((need) => (
                    <div
                      key={need.id}
                      className="flex items-center gap-3 border-t border-border-default py-2.5"
                    >
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <p className="truncate text-body-medium text-text-primary">
                          {`${need.ref} · ${need.label}`}
                        </p>
                        <p className="truncate text-caption text-text-tertiary">
                          {[
                            getUserName(users, need.userId),
                            categoryLabel(need.categoryId),
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <span className="shrink-0 text-caption whitespace-nowrap text-text-secondary">
                        {`${need.quantity} ${need.unit}`}
                      </span>
                      <button
                        type="button"
                        aria-label={`Retirer ${need.ref}`}
                        onClick={() =>
                          setSelected((prev) =>
                            prev.filter((n) => n.id !== need.id),
                          )
                        }
                        className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-text-tertiary outline-none hover:bg-hover hover:text-text-primary focus-visible:shadow-focus-ring"
                      >
                        <XIcon aria-hidden className="size-4" />
                      </button>
                    </div>
                  ))
                )}
              </Card>

              {/* Demande */}
              <Card className="gap-3.5 px-6 pt-5 pb-5.5">
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-heading-3 text-text-primary">
                    {"Demande"}
                  </h2>
                  <p className="text-caption text-text-tertiary">
                    {"Ces informations orientent les réponses des fournisseurs."}
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="titre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel isRequired>{"Objet de la demande"}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ex. Fournitures pour Cédric et Samuel en Papier et stylos"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date_limite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel isRequired>
                        {"Date limite de réponse"}
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "w-full justify-start gap-2 px-3 text-left font-normal",
                                !field.value && "text-text-placeholder",
                              )}
                            >
                              <CalendarIcon
                                aria-hidden
                                className="size-4 text-text-tertiary"
                              />
                              {field.value
                                ? format(field.value, "dd/MM/yyyy")
                                : "Choisir une date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 @min-[640px]:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isRequired>{"Contact principal"}</FormLabel>
                        <FormControl>
                          <SearchableSelect
                            value={field.value ? String(field.value) : ""}
                            onChange={field.onChange}
                            options={users.map((r) => ({
                              value: `${r.firstName} ${r.lastName}`,
                              label: `${r.firstName} ${r.lastName}`,
                            }))}
                            placeholder="Sélectionner un utilisateur"
                            width="w-full"
                            allLabel=""
                            className="h-9 rounded-md border-border-strong text-body text-text-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telephone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isRequired>
                          {"Numéro de téléphone"}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="ex. 06 12 34 56 78" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>
            </div>

            <div className="min-w-0 flex-1 @min-[1024px]:max-w-160">
              <DocumentPreview values={watched} needs={selected} />
            </div>
          </div>

          {/* Barre d'actions */}
          <Card className="flex-row items-center justify-between px-5 py-3.5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(LIST_HREF)}
            >
              {"Annuler"}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createCommand.isPending}
              isLoading={createCommand.isPending}
            >
              <PlusIcon aria-hidden />
              {"Créer la demande"}
            </Button>
          </Card>
        </form>
      </Form>

      <BesoinsPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        requests={requests}
        categories={categories}
        users={users}
        selectedIds={selected.map((n) => n.id)}
        onConfirm={confirmNeeds}
      />

      <DetailOrder
        open={successOpen}
        onOpenChange={(open) => {
          setSuccessOpen(open);
          // La demande est créée : retour à la liste.
          if (!open) router.push(LIST_HREF);
        }}
        data={created}
        message="Demande de cotation créée avec succès."
      />
    </>
  );
}
