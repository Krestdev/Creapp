// Element Form
'use client'
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { units } from '@/data/unit';
import { RequestModelT } from '@/types/types';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

const formSchema = z.object({
        id: z.number().optional(),
        needId: z.number({ message: 'Veuillez sélectionner un besoin' }),
        designation: z.string({ message: 'Veuillez renseigner une désignation' }),
        quantity: z.number(),
        unit: z.string(),
        price: z.number({ message: 'Veuillez renseigner un prix' })
      });

type ElementT = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  needs: Array<RequestModelT>;
  value?: ElementT[];
  onChange: (value: ElementT[]) => void;
  element?: ElementT;           // élément en cours d’édition
  index?: number | null;        // index de l’élément à modifier
}

function AddElement({
  open,
  openChange,
  needs,
  value,
  onChange,
  element,
  index
}: Props) {
  const isEdit = index !== undefined && index !== null;

  const form = useForm<ElementT>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: element?.id,
      needId: element?.needId,
      designation: element?.designation ?? '',
      quantity: element?.quantity ?? 1,
      unit: element?.unit ?? 'piece',
      price: element?.price ?? 1000
    }
  });

  // Important : reset le form quand on ouvre avec un nouvel élément
  React.useEffect(() => {
    if (open) {
      form.reset({
        id: element?.id,
        needId: element?.needId ?? undefined,
        designation: element?.designation ?? '',
        quantity: element?.quantity ?? 1,
        unit: element?.unit ?? 'piece',
        price: element?.price ?? 1000
      });
    }
  }, [element, open, form]);

  function onSubmit(values: ElementT) {
    if (value && value.length) {
      const next = [...value];

      if (isEdit && index! >= 0 && index! < next.length) {
        // 🔁 mode édition : on remplace l’élément à l’index donné
        next[index!] = values;
      } else {
        // ➕ mode ajout
        next.push(values);
      }

      onChange(next);
    } else {
      onChange([values]);
    }

    form.reset();
    openChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) {
          // à la fermeture, on nettoie l’état local du form
          form.reset();
        }
        openChange(state);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Modifier un élément du devis' : 'Ajouter un élément du devis'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Mettez à jour les informations de cet élément du devis.'
              : 'Complétez les informations de l’élément du devis.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <div className="grid grid-cols-1 @min-[440px]/dialog:grid-cols-2 gap-3">
            {/* Besoin */}
            <FormField
              control={form.control}
              name="needId"
              render={({ field }) => (
                <FormItem className="col-span-1 @min-[440px]/dialog:col-span-2">
                  <FormLabel isRequired>{"Besoin"}</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionnez un besoin" />
                      </SelectTrigger>
                      <SelectContent>
                        {needs.map((need) => (
                          <SelectItem key={need.id} value={String(need.id)}>
                            {need.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                <FormItem className="col-span-1 @min-[440px]/dialog:col-span-2">
                  <FormLabel isRequired>{"Désignation"}</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Libellé du produit" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quantité */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel isRequired>{"Quantité"}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === '' ? undefined : Number(e.target.value)
                        )
                      }
                      placeholder="ex. 10"
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
                <FormItem className="col-span-1">
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
            {/* Prix unitaire */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel isRequired>{"Prix unitaire"}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === '' ? undefined : Number(e.target.value)
                          )
                        }
                        className="pr-12"
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

            <DialogFooter className="col-span-1 @min-[440px]/dialog:col-span-2">
              <Button
                type="button"
                variant="primary"
                onClick={form.handleSubmit(onSubmit)}
              >
                {isEdit ? 'Modifier' : 'Ajouter'}
              </Button>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => openChange(false)}
                >
                  {"Annuler"}
                </Button>
              </DialogClose>
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default AddElement;
