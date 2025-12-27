'use client'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BonsCommande } from '@/types/types';
import React from 'react'

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  purchaseOrder: BonsCommande;
}

function ViewPurchase({open, openChange}:Props) {
  return (
    <Dialog open={open} onOpenChange={openChange}>
        <DialogContent className='sm:max-w-3xl'>
            <DialogHeader>
                <DialogTitle>{"Bon de commande"}</DialogTitle>
                <DialogDescription>{"Détails du bon de commande"}</DialogDescription>
            </DialogHeader>
        </DialogContent>
    </Dialog>
  )
}

export default ViewPurchase