"use client";
import { SearchableSelect } from "@/components/base/searchableSelect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { units } from "@/data/unit";
import { RequestModelT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Plus, Check, X, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  id: z.number().optional(),
  needId: z.number({ message: "Veuillez sélectionner un besoin" }),
  designation: z.string({ message: "Veuillez renseigner une désignation" }),
  quantity: z.number(),
  unit: z.string(),
  price: z.number({ message: "Veuillez renseigner un prix" }),
});

type ElementT = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  needs: Array<RequestModelT>;
  value?: ElementT[];
  onChange: (value: ElementT[]) => void;
  element?: ElementT;
  index?: number | null;
}

function AddElement({
  open,
  openChange,
  needs,
  value,
  onChange,
  element,
  index,
}: Props) {
  const isEdit = index !== undefined && index !== null;
  const [tempElements, setTempElements] = useState<ElementT[]>(value || []);
  const [editingElement, setEditingElement] = useState<{
    element: ElementT;
    index: number;
  } | null>(null);
  const [isAddingAnother, setIsAddingAnother] = useState(false);

  const form = useForm<ElementT>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: undefined,
      needId: undefined,
      designation: "",
      quantity: 1,
      unit: "piece",
      price: 1000,
    },
  });

  // Réinitialiser le formulaire quand on ouvre le dialog
  React.useEffect(() => {
    if (open) {
      if (editingElement) {
        form.reset(editingElement.element);
      } else if (isEdit && element) {
        form.reset(element);
      } else {
        form.reset({
          id: undefined,
          needId: undefined,
          designation: "",
          quantity: 1,
          unit: "piece",
          price: 1000,
        });
      }
      setTempElements(value || []);
    }
  }, [open, editingElement, element, isEdit, form, value]);

  // Fonction pour ajouter un élément temporaire
  const addTemporaryElement = (values: ElementT) => {
    const newElement = { ...values };

    if (editingElement) {
      // Mode édition
      const updated = [...tempElements];
      updated[editingElement.index] = newElement;
      setTempElements(updated);
      setEditingElement(null);
    } else {
      // Mode ajout
      setTempElements([...tempElements, newElement]);
    }

    // Réinitialiser le formulaire pour le prochain ajout
    form.reset({
      id: undefined,
      needId: undefined,
      designation: "",
      quantity: 1,
      unit: "piece",
      price: 1000,
    });

    setIsAddingAnother(true);
  };

  // Fonction pour éditer un élément temporaire
  const editTemporaryElement = (index: number) => {
    const elementToEdit = tempElements[index];
    setEditingElement({ element: elementToEdit, index });
    form.reset(elementToEdit);
  };

  // Fonction pour supprimer un élément temporaire
  const deleteTemporaryElement = (index: number) => {
    const updated = tempElements.filter((_, i) => i !== index);
    setTempElements(updated);

    // Si on supprime l'élément en cours d'édition
    if (editingElement?.index === index) {
      setEditingElement(null);
      form.reset({
        id: undefined,
        needId: undefined,
        designation: "",
        quantity: 1,
        unit: "piece",
        price: 1000,
      });
    }
  };

  // Fonction pour valider tous les éléments
  const saveAllElements = () => {
    onChange(tempElements);
    form.reset({
      id: undefined,
      needId: undefined,
      designation: "",
      quantity: 1,
      unit: "piece",
      price: 1000,
    });
    setTempElements([]);
    setEditingElement(null);
    setIsAddingAnother(false);
    openChange(false);
  };

  // Fonction pour annuler
  const handleCancel = () => {
    onChange(value || []);
    form.reset({
      id: undefined,
      needId: undefined,
      designation: "",
      quantity: 1,
      unit: "piece",
      price: 1000,
    });
    setTempElements([]);
    setEditingElement(null);
    setIsAddingAnother(false);
    openChange(false);
  };

  // Calcul du total
  const calculateTotal = () => {
    return tempElements.reduce((sum, item) => {
      return sum + (item.price || 0) * (item.quantity || 0);
    }, 0);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) {
          handleCancel();
        }
      }}
    >
      <DialogContent className="max-w-5xl! max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="h-fit">
            {isEdit
              ? "Modifier un élément du devis"
              : "Ajouter des éléments au devis"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Mettez à jour les informations de cet élément du devis."
              : "Ajoutez autant d'éléments que nécessaire. Tous seront enregistrés ensemble."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Formulaire à gauche */}
          <div className="overflow-y-auto pr-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(addTemporaryElement)} className="space-y-4">
                {/* Besoin */}
                <FormField
                  control={form.control}
                  name="needId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel isRequired>{"Besoin"}</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          width="w-full"
                          allLabel=""
                          options={
                            needs.map((need) => ({
                              label: need.label,
                              value: need.id.toString(),
                            })) || []
                          }
                          value={field.value?.toString() || ""}
                          onChange={(value) => field.onChange(parseInt(value))}
                          placeholder="Sélectionnez un besoin"
                        // disabled={editingElement !== null}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Désignation */}
                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel isRequired>{"Désignation"}</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Libellé du produit" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  {/* Quantité */}
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isRequired>{"Quantité"}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value)
                              )
                            }
                            placeholder="ex. 10"
                            min="1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Unité */}
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isRequired>{"Unité"}</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                              {units.map((unit) => (
                                <SelectItem key={unit.value} value={unit.value}>
                                  {unit.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Prix unitaire */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel isRequired>{"Prix unitaire"}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value)
                              )
                            }
                            className="pr-12"
                            placeholder="0"
                            min="0"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-base uppercase">
                            {"FCFA"}
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="default"
                    className="flex-1"
                    onClick={() => addTemporaryElement(form.getValues())}
                  >
                    {editingElement ? (
                      <>
                        <Pencil className="w-4 h-4 mr-2" />
                        Modifier l'élément
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter à la liste
                      </>
                    )}
                  </Button>

                  {editingElement && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingElement(null);
                        form.reset({
                          id: undefined,
                          needId: undefined,
                          designation: "",
                          quantity: 1,
                          unit: "piece",
                          price: 1000,
                        });
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Annuler modification
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>

          {/* Liste des éléments à droite */}
          <div className="border rounded-lg overflow-hidden flex flex-col">
            <div className="p-3 border-b bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Éléments ajoutés</h3>
                <Badge variant="secondary">
                  {tempElements.length} élément(s)
                </Badge>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {tempElements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-sm">Aucun élément ajouté</div>
                  <div className="text-xs mt-1">
                    Remplissez le formulaire et cliquez sur "Ajouter à la liste"
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    // Regrouper les éléments par besoin
                    const groupedElements = tempElements.reduce(
                      (acc, item, globalIndex) => {
                        const need = item.needId;
                        if (!acc[need]) {
                          acc[need] = [];
                        }
                        acc[need].push({ ...item, globalIndex });
                        return acc;
                      },
                      {} as Record<
                        string,
                        Array<ElementT & { globalIndex: number }>
                      >
                    );

                    return Object.entries(groupedElements).map(
                      ([need, elements]) => (
                        <div
                          key={need}
                          className="border p-3 rounded-lg bg-gray-50"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold">
                              {needs.find((n) => n.id === Number(need))?.label}
                            </h3>
                          </div>
                          <div className="space-y-2">
                            {elements.map((item, localIndex) => (
                              <div
                                key={localIndex}
                                className={`w-full bg-white rounded-sm border px-3 py-2 inline-flex justify-between gap-2 items-center text-sm ${editingElement?.index === item.globalIndex
                                  ? 'border-blue-300 bg-blue-50'
                                  : 'border-gray-200'
                                  }`}
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="min-w-6 w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-xs text-gray-600">
                                    {localIndex + 1}
                                  </div>
                                  <div className="truncate flex-1">
                                    <div className="font-medium truncate">{item.designation}</div>
                                    <div className="text-xs text-gray-600 truncate">
                                      {item.quantity} {item.unit} • {item.price.toLocaleString()} FCFA
                                    </div>
                                  </div>
                                </div>

                                <div className="flex gap-1 items-center">
                                  <button
                                    type="button"
                                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-blue-100 border-blue-600 text-blue-600 cursor-pointer"
                                    onClick={() => editTemporaryElement(item.globalIndex)}
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-red-100 border-red-600 text-red-600 cursor-pointer"
                                    onClick={() => deleteTemporaryElement(item.globalIndex)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 pt-4 border-t flex justify-end w-full">
          <div className="flex justify-between w-full">
            <div className="flex gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Annuler
              </Button>

              <Button
                type="button"
                variant="primary"
                onClick={saveAllElements}
                disabled={tempElements.length === 0}
              >
                <Check className="w-4 h-4 mr-2" />
                Enregistrer {tempElements.length > 0 ? `(${tempElements.length})` : ''}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddElement;