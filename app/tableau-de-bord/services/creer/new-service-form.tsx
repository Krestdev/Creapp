"use client";
import MultiSelectUsers from "@/components/base/multiSelectUsers";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NewService, serviceQ } from "@/queries/services";
import { User } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  users: User[];
}

const formSchema = z.object({
  label: z
    .string()
    .min(3, "Le nom du service doit contenir au moins 3 caractères"),
  description: z.string().min(10, "La description est requise"),
  headId: z.coerce.number().min(1, "Le chef du service est requis"),
  users: z.array(z.number()).min(1, "Au moins un employé est requis"),
});

type FormSchema = z.infer<typeof formSchema>;

function NewServiceForm({ users }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      description: "",
      headId: undefined,
      users: [],
    },
  });

  const mutation = useMutation({
    mutationFn: (data: NewService) => serviceQ.create(data),
    onSuccess: () => {
      toast.success("Service créé avec succès !");
      queryClient.invalidateQueries({ queryKey: ["services"] });
      router.push("/tableau-de-bord/services");
    },
    onError: () => {
      toast.error("Erreur lors de la création du service.");
    },
  });

  function onSubmit(values: FormSchema) {
    mutation.mutate({
      label: values.label,
      description: values.description,
      headId: values.headId,
      users: values.users,
    });
  }

  // const headOptions = users.map((u) => ({
  //   value: String(u.id),
  //   label: `${u.firstName} ${u.lastName}`,
  // }));

  const allMembers = users.map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
  }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="form-3xl">
        {/* Nom */}
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Nom du service"}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex. Direction Générale" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Chef de service */}
        <FormField
          control={form.control}
          name="headId"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>{"Chef de service"}</FormLabel>
              <FormControl>
                {/* <SearchableSelect
                  value={field.value ? String(field.value) : undefined}
                  onChange={(val) =>
                    field.onChange(val ? Number(val) : undefined)
                  }
                  options={headOptions}
                  placeholder="Sélectionner un chef de service"
                /> */}
                <Combobox
                  items={users}
                  value={users.find((user) => user.id === field.value) ?? null}
                  onValueChange={(v) => field.onChange(v?.id ?? "")}
                  itemToStringLabel={(v) => v.firstName.concat(" ", v.lastName)}
                >
                  <ComboboxInput placeholder="Sélectionner" />
                  <ComboboxContent>
                    <ComboboxEmpty>
                      {"Aucun utilisateur enregistré"}
                    </ComboboxEmpty>
                    <ComboboxList>
                      {(item: User) => (
                        <ComboboxItem key={item.id} value={item}>
                          {item.firstName.concat(" ", item.lastName)}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel isRequired>{"Description"}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Décrivez les responsabilités de ce service..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Membres */}
        <FormField
          control={form.control}
          name="users"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel isRequired>{"Membres du service"}</FormLabel>
              <FormControl>
                <MultiSelectUsers
                  display="user"
                  users={allMembers}
                  selected={allMembers.filter((u) =>
                    field.value.includes(u.id),
                  )}
                  onChange={(selected) =>
                    field.onChange(selected.map((u) => u.id))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="w-full col-span-full flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {"Annuler"}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={mutation.isPending}
            isLoading={mutation.isPending}
          >
            {"Créer le service"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default NewServiceForm;
