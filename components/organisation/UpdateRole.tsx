"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerEyebrow,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { userQ } from "@/queries/baseModule";
import { Role } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

const formSchema = z.object({
  label: z.string(),
});

interface UpdateRequestProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  departmentData: Role | null;
  onSuccess?: () => void;
}

export default function UpdateRole({
  open,
  setOpen,
  departmentData,
  onSuccess,
}: UpdateRequestProps) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
    },
  });

  useEffect(() => {
    form.reset({
      label: departmentData?.label || "",
    });
  }, [departmentData, form]);

  const departmentMutation = useMutation({
    mutationFn: async (data: Partial<Role>) =>
      userQ.updateRole(Number(departmentData?.id), data),

    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Besoin modifié avec succès !");
      setOpen(false);
      onSuccess?.();
    },

    onError: (e) => {
      console.error(e);
      toast.error("Une erreur est survenue lors de la modification.");
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    departmentMutation.mutate({
      label: values.label.toUpperCase().trim().replace(" ", "_"),
    });
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        {/* Header avec fond bordeaux - FIXE */}
        <DrawerHeader>
          <DrawerEyebrow>{"Réglages"}</DrawerEyebrow>
          <DrawerTitle>
            Modifier le besoin
          </DrawerTitle>
          <DrawerDescription>
            Modifiez les informations du besoin existant
          </DrawerDescription>
        </DrawerHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <DrawerBody className="space-y-6">
            {/* LABEL */}
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter label" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            </DrawerBody>
            <DrawerFooter pinned>
              <Button type="submit" variant="primary">
                Submit
              </Button>
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
}
