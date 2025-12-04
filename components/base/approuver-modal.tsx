"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Hash,
  FolderOpen,
  FileText,
  FolderTree,
  AlertCircle,
  Users,
  UserPlus,
  Calendar,
  X,
} from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { TableData } from "@/types/types";

interface DetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: TableData | null;
}

const formSchema = z.object({
  message: z.string(),
});


export function ApproveModal({ open, onOpenChange, data }: DetailModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });
  if (!data) return null;

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto gap-0 overflow-x-hidden border-none">
        {/* Header with burgundy background */}
        <DialogHeader variant={"success"}>
          <DialogTitle className="text-xl font-semibold text-white">
            {"Soumettre un besoin"}
          </DialogTitle>
          <DialogDescription>{"Approbation du besoin"}</DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Info */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">{"Attention"}</p>
              <p className="text-sm">
                {"Êtes-vous sûr de vouloir soumettre ce besoin ?"}
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    {/* <FormLabel>Message</FormLabel> */}
                    <FormControl>
                      <Input
                        placeholder="Raison du rejet"
                        className="resize-none"
                        hidden
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Footer buttons */}
              <div className="flex gap-3 pt-0">
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {"Rejeter"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => onOpenChange(false)}
                >
                  {"Annuler"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
