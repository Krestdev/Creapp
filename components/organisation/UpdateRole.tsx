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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { userQ } from "@/queries/baseModule";
import { Role } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[760px] w-full max-h-[90vh] p-0 gap-0 flex flex-col">
        {/* Header avec fond bordeaux - FIXE */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 shrink-0">
          <DialogTitle className="text-xl font-semibold text-white">
            Modifier le besoin
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            Modifiez les informations du besoin existant
          </p>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 p-6"
          >
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

            {/* SUBMIT */}
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
