'use client'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Provider } from '@/types/types';
import React from 'react'

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  provider: Provider;
}

function ViewProvider({open, openChange, provider}:Props) {
  return (
    <Dialog open={open} onOpenChange={openChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{`Fournisseur ${provider.name}`}</DialogTitle>
                <DialogDescription>{"Informations relatives au fournisseur"}</DialogDescription>
            </DialogHeader>
            <div>
                
            </div>
        </DialogContent>
    </Dialog>
  )
}

export default ViewProvider