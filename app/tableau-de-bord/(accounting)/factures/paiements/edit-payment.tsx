'use client'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BonsCommande, PaymentRequest } from '@/types/types';
import React from 'react'
import EditPaymentForm from './edit-payment-form';

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  payment: PaymentRequest;
  purchases: Array<BonsCommande>;
}

function EditPayment({open, openChange, payment, purchases}:Props) {
    const purchase = purchases.find((p) => p.id === payment.commandId);
  return (
    <Dialog open={open} onOpenChange={openChange}>
    <DialogContent className="sm:max-w-3xl">
        <DialogHeader variant={"secondary"}>
            <DialogTitle>{`Modifier ${purchase?.devi.commandRequest.title}`}</DialogTitle>
            <DialogDescription>{`Modifiez les informations du paiement`}</DialogDescription>
        </DialogHeader>
            <EditPaymentForm payment={payment} purchases={purchases} openChange={openChange} />
    </DialogContent>
  </Dialog>
  )
}

export default EditPayment