'use client'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import React from 'react'
import { PaymentRequest } from '@/types/types';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface Props {
  ticket: PaymentRequest
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
    account: z.string().min(1, "Le compte est requis"),
    justification: z.array(z.instanceof(File, { message: "Doit être un fichier valide" })).min(1, "La justification est requise"),
})

function PayExpense({ticket, open, onOpenChange}:Props) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            account: '',
            justification: [],
        }
    });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
            <DialogTitle>{`Payer ${ticket.title}`}</DialogTitle>
            <DialogDescription>{`Paiement du ticket ${ticket.reference}`}</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4'>

        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PayExpense