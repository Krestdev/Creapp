import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

// Schéma de validation avec Zod
const formSchema = z.object({
  motif: z.string().min(10, {
    message: "Le motif doit contenir au moins 10 caractères.",
  }).max(500, {
    message: "Le motif ne peut pas dépasser 500 caractères.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  children: React.ReactNode;
  id: number;
  action: (id: number, motif: string) => void;
  name?: string;
  section?: string;
};

function RejeterBesoin({ children, id, action }: Props) {
  const [open, setOpen] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      motif: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    action(id, values.motif);
    setOpen(false);
    form.reset();
  };

  const handleCancel = () => {
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[420px] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-semibold leading-[100%] tracking-[-2%]">
            Rejeter un besoin
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="motif"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motif du rejet</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez la raison du rejet..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-3 flex-wrap items-center justify-end pt-4">
              <Button 
                variant="destructive" 
                className="h-10"
                disabled={form.formState.isSubmitting}
                onClick={form.handleSubmit(onSubmit)}
              >
                {form.formState.isSubmitting ? "Rejet..." : "Rejeter"}
              </Button>
              <Button 
                variant="outline" 
                className="h-10"
                onClick={handleCancel}
              >
                Annuler
              </Button>
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default RejeterBesoin;