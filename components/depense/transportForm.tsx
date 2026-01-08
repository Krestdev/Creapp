"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { motion } from "motion/react";
import { Check, LoaderIcon } from "lucide-react";
import {
  Field,
  FieldGroup,
  FieldContent,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldSeparator,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import FilesUpload from "../comp-547";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PaymentQueries } from "@/queries/payment";
import { PaymentRequest } from "@/types/types";
import { useStore } from "@/providers/datastore";
import { ProjectQueries } from "@/queries/projectModule";
import { UserQueries } from "@/queries/baseModule";
import { toast } from "sonner";
import { useState } from "react";
import { SuccessModal } from "../modals/success-modal";

export interface ActionResponse<T = any> {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof T]?: string[];
  };
  inputs?: T;
}

const FileSchema = z
  .array(
    z.union([
      z.instanceof(File, { message: "Doit être un fichier valide" }),
      z.string(),
    ])
  )
  .max(5, "Pas plus d'un document");

export const formSchema = z.object({
  title: z.string({ message: "Ce champ est requis" }),
  Beneficier: z.string({ message: "This field is required" }),
  Montent: z.coerce.number({ message: "Please enter a valid number" }),
  Description: z.string({ message: "This field is required" }),
  Project: z.string().min(1, "Please select an item"),
  Justificatif: FileSchema,
});

type Schema = z.infer<typeof formSchema>;

export function TransportForm() {
  const form = useForm<Schema>({
    resolver: zodResolver(formSchema as any),
  });

  const { user } = useStore();

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const payments = new PaymentQueries();
  const paymentsData = useMutation({
    mutationKey: ["payments-Depense"],
    mutationFn: async (
      data: Omit<PaymentRequest, "id" | "createdAt" | "updatedAt">
    ) => payments.createDepense(data),
    onSuccess: () => {
      toast.success("Depense soumis avec succès !");
      setIsSuccessModalOpen(true);
      form.reset();
    },
  });

  const projects = new ProjectQueries();
  const ProjectsData = useQuery({
    queryKey: ["getProjects"],
    queryFn: () => projects.getAll(),
  });

  const users = new UserQueries();
  const usersData = useQuery({
    queryKey: ["getUsers"],
    queryFn: () => users.getAll(),
  });

  const handleSubmit = form.handleSubmit(async (data: Schema) => {
    const payment: Omit<PaymentRequest, "id" | "createdAt" | "updatedAt"> = {
      title: data.title,
      price: data.Montent,
      description: data.Description,
      benefId: Number(data.Beneficier),
      justification: data.Justificatif,
      status: "paid",
      type: "PURCHASE",
      method: "cash",
      priority: "medium",
      isPartial: false,
      userId: user!.id,
      deadline: new Date(),
      proof: "",
      reference: "",
    };
    paymentsData.mutate({ ...payment });
  });

  if (!paymentsData.isPending && paymentsData.isSuccess) {
    return (
      <div className="p-2 sm:p-5 md:p-8 w-full rounded-md gap-2 border">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, stiffness: 300, damping: 25 }}
          className="h-full py-6 px-3"
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.3,
              type: "spring",
              stiffness: 500,
              damping: 15,
            }}
            className="mb-4 flex justify-center border rounded-full w-fit mx-auto p-2"
          >
            <Check className="size-8" />
          </motion.div>
          <h2 className="text-center text-2xl text-pretty font-bold mb-2">
            Thank you
          </h2>
          <p className="text-center text-lg text-pretty text-muted-foreground">
            Form submitted successfully, we will get back to you soon
          </p>
        </motion.div>
      </div>
    );
  }
  return (
    !ProjectsData.isLoading &&
    !usersData.isLoading &&
    usersData.data &&
    ProjectsData.data && (
      <>
        <Form {...form}>
          <form
            onSubmit={handleSubmit}
            className="p-2 sm:p-5 md:p-8 w-full rounded-md gap-2 max-w-3xl"
          >
            <FieldGroup className="grid md:grid-cols-6 gap-4 mb-6">
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-full"
                  >
                    <FieldLabel htmlFor="title">Titre *</FieldLabel>
                    <Input
                      {...field}
                      id="title"
                      type="text"
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                      aria-invalid={fieldState.invalid}
                      placeholder="Le titre"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="Beneficier"
                control={form.control}
                render={({ field, fieldState }) => {
                  const options = usersData.data.data.map((user) => {
                    return { value: user.id, label: user.firstName };
                  });
                  return (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="gap-1 col-span-full"
                    >
                      <FieldLabel htmlFor="Beneficier">Beneficier *</FieldLabel>

                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selectioner un Beneficier" />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value.toString()}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
              />

              <Controller
                name="Montent"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-full"
                  >
                    <FieldLabel htmlFor="Montent">Montent *</FieldLabel>
                    <Input
                      {...field}
                      id="Montent"
                      type="number"
                      onChange={(e) => {
                        field.onChange(e.target.valueAsNumber);
                      }}
                      aria-invalid={fieldState.invalid}
                      placeholder="1000"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="Description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-full"
                  >
                    <FieldLabel htmlFor="Description">Description *</FieldLabel>
                    <Textarea
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id="Description"
                      placeholder="Description"
                    />
                    <FieldDescription>
                      Description de la depense
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="Project"
                control={form.control}
                render={({ field, fieldState }) => {
                  const options = ProjectsData.data?.data.map((p) => {
                    return { value: p.id, label: p.label };
                  });
                  return (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="gap-1 col-span-full"
                    >
                      <FieldLabel htmlFor="Project associer">
                        Projet *
                      </FieldLabel>

                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selectioner un projet" />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((option, id) => (
                            <SelectItem
                              key={id}
                              value={option.value!.toString()}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
              />

              <Controller
                name="Justificatif"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div>
                    <FormField
                      control={form.control}
                      name="Justificatif"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Justificatif"}</FormLabel>
                          <FormControl>
                            <FilesUpload
                              value={field.value || []}
                              onChange={field.onChange}
                              name={field.name}
                              acceptTypes="all"
                              multiple={false}
                              maxFiles={1}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {Array.isArray(fieldState.error) ? (
                      fieldState.error?.map((error, i) => (
                        <p
                          key={i}
                          role="alert"
                          data-slot="field-error"
                          className="text-destructive text-sm"
                        >
                          {error.message}
                        </p>
                      ))
                    ) : (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </div>
                )}
              />
            </FieldGroup>
            <div className="flex justify-end items-center w-full">
              {/* <Button>
              {paymentsData.isPending ? "Submitting..." : "Submit"}
            </Button> */}
              <Button
                variant={"primary"}
                disabled={paymentsData.isPending}
                type="submit"
                className="min-w-[200px]"
              >
                {paymentsData.isPending ? (
                  <>
                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                    {"Soumission en cours..."}
                  </>
                ) : (
                  "Soumettre la depense"
                )}
              </Button>
            </div>
          </form>
        </Form>
        <SuccessModal
          open={isSuccessModalOpen}
          onOpenChange={setIsSuccessModalOpen}
          message="Votre besoin a été soumis avec succès. Il sera traité par notre équipe."
        />
      </>
    )
  );
}
