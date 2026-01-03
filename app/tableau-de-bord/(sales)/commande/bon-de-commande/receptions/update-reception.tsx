'use client'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ReceptionCompletion, ReceptionQuery } from '@/queries/reception';
import { Reception } from '@/types/types';
import { useMutation } from '@tanstack/react-query';
import React from 'react'

interface Props {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  reception: Reception;
}

function UpdateReception({open, onOpenChange, reception}:Props) {
    const receptionQuery = new ReceptionQuery();
    const markReception = useMutation({
        mutationFn: ({id, Deliverables}:ReceptionCompletion)=>receptionQuery.completeReception({id, Deliverables}),
        onSuccess: ()=>{
            /** */
        },
        onError: (error: Error)=>{
            /** */
        }

    });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader variant={"secondary"}>
                <DialogTitle>{reception.Command.devi.commandRequest.title}</DialogTitle>
                <DialogDescription>{"Compléter la réception"}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4">
            </div>
        </DialogContent>
    </Dialog>
  )
}

export default UpdateReception