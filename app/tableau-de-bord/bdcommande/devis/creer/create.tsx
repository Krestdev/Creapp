//Quotation Form
'use client'
import FilesUpload from '@/components/comp-547'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { useFetchQuery } from '@/hooks/useData'
import { CommandQueries } from '@/queries/commandModule'
import { ProviderQueries } from '@/queries/providers'
import { CommandRequestT, Provider, RequestModelT } from '@/types/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { SelectValue } from '@radix-ui/react-select'
import { FolderX, Plus, X, Pencil } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import AddElement from './addElement'

const formSchema = z.object({
  quotationId: z.number({ message: 'Requis' }),
  providerId: z.number({ message: 'Requis' }),
  elements: z
    .array(
      z.object({
        needId: z.number({ message: 'Veuillez sélectionner un besoin' }),
        designation: z.string({ message: 'Veuillez renseigner une désignation' }),
        quantity: z.number(),
        unit: z.string(),
        price: z.number({ message: 'Veuillez renseigner un prix' })
      })
    )
    .min(1),
  proof: z
    .array(
      z.union([
        z.instanceof(File, { message: 'Doit être un fichier valide' }),
        z.string().url({ message: 'Doit être une URL valide' })
      ])
    )
    .min(1, 'Veuillez renseigner au moins 1 justificatif')
    .max(1, "Pas plus d'un justificatif")
});

type FormValues = z.infer<typeof formSchema>;

function CreateQuotation() {
  const [open, setOpen] = React.useState<boolean>(false);
  const [selectedNeeds, setSelectedNeeds] = React.useState<Array<RequestModelT>>();
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);

  /**Demandes de cotation */
  const requestsQuery = new CommandQueries();
  const requestsData = useFetchQuery(['commands'], requestsQuery.getAll);
  /**Fournisseurs */
  const providerQuery = new ProviderQueries();
  const providersData = useFetchQuery(['providers'], providerQuery.getAll, 500000);

  /**Data states */
  const [requests, setRequests] = React.useState<Array<CommandRequestT>>([]);
  const [providers, setProviders] = React.useState<Array<Provider>>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quotationId: undefined,
      providerId: undefined,
      elements: [],
      proof: undefined
    }
  });

  const quotationId = form.watch('quotationId');

  React.useEffect(() => {
    if (requestsData.isSuccess) {
      setRequests(requestsData.data.data);
    }
    if (providersData.isSuccess) {
      setProviders(providersData.data.data);
    }
  }, [requestsData.isSuccess, providersData.isSuccess]);

  React.useEffect(() => {
    if (quotationId) {
      const req = requests.find((x) => x.id === quotationId);
      setSelectedNeeds(req?.besoins);
    } else {
      setSelectedNeeds(undefined);
    }
  }, [quotationId, requests]);

  function onSubmit(values: FormValues) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-3xl grid grid-cols-1 gap-4 @min-[640px]:grid-cols-2"
      >
        {/* Demande de cotation */}
        <FormField
          control={form.control}
          name="quotationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Demande de cotation"}</FormLabel>
              <FormControl>
                <Select
                  defaultValue={field.value ? String(field.value) : undefined}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <SelectTrigger className="min-w-60 w-full">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {requests.length === 0 ? (
                      <SelectItem value="-" disabled>
                        {"Aucune demande enregistrée"}
                      </SelectItem>
                    ) : (
                      requests.map((request) => (
                        <SelectItem key={request.id} value={String(request.id)}>
                          {request.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Fournisseur */}
        <FormField
          control={form.control}
          name="providerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Fournisseur"}</FormLabel>
              <FormControl>
                <Select
                  defaultValue={field.value ? String(field.value) : undefined}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <SelectTrigger className="min-w-60 w-full">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.length === 0 ? (
                      <SelectItem value="-" disabled>
                        {"Aucun fournisseur enregistré"}
                      </SelectItem>
                    ) : (
                      providers.map((provider) => (
                        <SelectItem key={provider.id} value={String(provider.id)}>
                          {provider.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Éléments */}
        <FormField
          control={form.control}
          name="elements"
          render={({ field }) => (
            <FormItem className="h-fit @min-[640px]:col-span-2">
              <FormLabel isRequired>{"Éléments"}</FormLabel>
              <FormControl>
                <div className="grid gap-1.5">
                  {field.value.length === 0 ? (
                    <span className="px-4 py-3 w-full text-center text-muted-foreground text-sm flex flex-col gap-2 justify-center items-center">
                      <span className="inline-flex size-10 rounded-full bg-muted text-muted-foreground items-center justify-center">
                        <FolderX />
                      </span>
                      {"Aucun élément renseigné."}
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {field.value.map((item, idx) => (
                        <div
                          key={idx}
                          className="w-full bg-gray-50 rounded-sm border border-gray-200 px-2 h-9 inline-flex justify-between gap-2 items-center text-sm"
                        >
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 w-full justify-between text-left truncate cursor-pointer"
                            onClick={() => {
                              setEditingIndex(idx);
                              setOpen(true);
                            }}
                          >
                            <span className="truncate">{item.designation}</span>
                            <span className='text-xs font-medium px-1.5 py-0.5 rounded bg-foreground text-primary-foreground'>{"Modifier"}</span>
                          </button>
                          <X
                            size={20}
                            className="text-destructive cursor-pointer"
                            onClick={() =>
                              field.onChange(field.value.filter((_, i) => i !== idx))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    className="add-button inline-flex items-center gap-2 text-sm text-primary"
                    onClick={(e) => {
                      e.preventDefault();
                      setEditingIndex(null); // mode ajout
                      setOpen(true);
                    }}
                    disabled={!selectedNeeds}
                  >
                    {"Ajouter un élément"}
                    <Plus className="w-4 h-4" />
                  </button>

                  {!!selectedNeeds && (
                    <AddElement
                      open={open}
                      openChange={(state) => {
                        if (!state) setEditingIndex(null);
                        setOpen(state);
                      }}
                      needs={selectedNeeds}
                      value={field.value}
                      onChange={field.onChange}
                      element={
                        editingIndex !== null ? field.value[editingIndex] : undefined
                      }
                      index={editingIndex}
                    />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Justificatif */}
        <FormField
          control={form.control}
          name="proof"
          render={({ field }) => (
            <FormItem className="@min-[640px]:col-span-2">
              <FormLabel isRequired>{"Justificatif"}</FormLabel>
              <FormControl>
                <FilesUpload
                  value={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  acceptTypes="images"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={false} className="w-fit">
          {"Créer le devis"}
        </Button>
      </form>
    </Form>
  );
}

export default CreateQuotation;
