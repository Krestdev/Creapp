"use client";
import {
  Dialog,
  DialogContent,
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
import type { TableData } from "./data-table";
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

interface DetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: TableData | null;
}

const formSchema = z.object({
  message: z.string(),
});

export function ApproveModal({ open, onOpenChange, data }: DetailModalProps) {
  if (!data) return null;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

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

  const statusConfig = {
    pending: {
      label: "En attente",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    },
    approved: {
      label: "Approuvé",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    rejected: {
      label: "Rejeté",
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    },
    "in-review": {
      label: "En révision",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-screen overflow-y-auto p-0 gap-0 overflow-x-hidden border-none">
        {/* Header with burgundy background */}
        <DialogHeader className="bg-[#15803D] text-white p-6 m-4 rounded-lg pb-8 relative">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10"
          >
            {/* <X className="h-4 w-4 text-white" /> */}
            <span className="sr-only">Close</span>
          </button>
          <DialogTitle className="text-xl font-semibold text-white">
            Approuver un besoin
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">Approbation du besoin</p>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Info */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Attention</p>
              <p className="text-sm">
                Êtes-vous sûr de vouloir approuver ce besoin ?
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
                  Rejeter
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => onOpenChange(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
