'use client'
import { Badge, badgeVariants } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { XAF } from '@/lib/utils';
import { BonsCommande, User } from '@/types/types';
import { VariantProps } from 'class-variance-authority';
import { format } from 'date-fns';
import { BriefcaseBusiness, Calendar, CalendarFold, CircleAlert, DollarSign, Hammer, LucideHash, Package, SquareUser, TriangleAlert, UserRound } from 'lucide-react';
import React from 'react'

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  purchaseOrder: BonsCommande;
  users: Array<User>
}

function ViewPurchase({open, openChange, purchaseOrder, users}:Props) {

  const priority = (value: BonsCommande["priority"]):{label:string; variant:VariantProps<typeof badgeVariants>["variant"]} => {
    switch (value){
      case "low":
        return { label: "Basse", variant: "outline"};
      case "medium":
        return { label: "Normale", variant: "default" };
      case "high":
        return { label: "Élevée", variant: "amber"};
      case "urgent":
        return { label: "Urgent", variant: "primary"};
      default:
        return  {label : value, variant: "default" }
    }
  };
  const status = (value: BonsCommande["status"]):{label:string; variant:VariantProps<typeof badgeVariants>["variant"]} => {
    switch(value){
      case "PENDING":
        return {label: "En attente", variant: "amber"};
      case "APPROVED":
        return {label: "Approuvé", variant: "success"};
      case "REJECTED":
        return {label: "Rejeté", variant: "destructive"};
      case "IN-REVIEW":
        return {label: "En révision", variant: "teal"}
    }
  };
  const user = users.find(u=> u.id === purchaseOrder.devi.userId);

  return (
    <Dialog open={open} onOpenChange={openChange}>
        <DialogContent className='sm:max-w-3xl'>
            <DialogHeader>
                <DialogTitle>{"Bon de commande"}</DialogTitle>
                <DialogDescription>{"Détails du bon de commande"}</DialogDescription>
            </DialogHeader>
            <section className="grid grid-cols-1 @min-[560px]/dialog:grid-cols-2 gap-3">
              <div className="view-group">
                <span className="view-icon">
                  <LucideHash/>
                </span>
                <div>
                  <p>{"Référence"}</p>
                  <span className="bg-primary-100 text-primary-600 px-1.5 uppercase rounded leading-[150%]">{purchaseOrder.reference}</span>
                </div>
              </div>
              <div className="view-group">
                <span className="view-icon">
                  <DollarSign/>
                </span>
                <div>
                  <p>{"Montant"}</p>
                  <span className="bg-primary-100 text-primary-600 px-1.5 uppercase rounded leading-[150%]">{purchaseOrder.reference}</span>
                </div>
              </div>
              <div className="view-group">
                <span className="view-icon">
                  <BriefcaseBusiness/>
                </span>
                <div>
                  <p>{"Projets associés"}</p>
                  <span className="bg-primary-100 text-primary-600 px-1.5 uppercase rounded leading-[150%]">{purchaseOrder.reference}</span>
                </div>
              </div>
              <div className="view-group">
                <span className="view-icon">
                  <TriangleAlert/>
                </span>
                <div>
                  <p>{"Priorité"}</p>
                  <Badge variant={priority(purchaseOrder.priority).variant}>{priority(purchaseOrder.priority).label}</Badge>
                </div>
              </div>
              <div className="view-group">
                <span className="view-icon">
                  <SquareUser/>
                </span>
                <div>
                  <p>{"Fournisseur"}</p>
                  <p className="font-semibold">{purchaseOrder.provider.name}</p>
                </div>
              </div>
              <div className="view-group">
                <span className="view-icon">
                  <CircleAlert/>
                </span>
                <div>
                  <p>{"Statut"}</p>
                  <Badge variant={status(purchaseOrder.status).variant}>{status(purchaseOrder.status).label}</Badge>
                </div>
              </div>
              <div className="view-group">
                <span className="view-icon">
                  <Hammer/>
                </span>
                <div>
                  <p>{"Pénalités"}</p>
                  <p className="font-semibold">{purchaseOrder.hasPenalties === true ? XAF.format(purchaseOrder.amountBase) : XAF.format(0)}</p>
                </div>
              </div>
              <div className="view-group">
                <span className="view-icon">
                  <Package/>
                </span>
                <div>
                  <p>{"Réception"}</p>
                  <Badge variant={"destructive"}>{"Non"}</Badge>
                </div>
              </div>
              <div className="view-group">
                <span className="view-icon">
                  <UserRound/>
                </span>
                <div>
                  <p>{"Initié par"}</p>
                  <p className="font-semibold">{user ? user.name : "Non défini"}</p>
                </div>
              </div>
              <div className="view-group">
                <span className="view-icon">
                  <CalendarFold/>
                </span>
                <div>
                  <p>{"Date limite"}</p>
                  <p className="font-semibold">{format(new Date(purchaseOrder.deliveryDelay), "dd LLLL yyyy")}</p>
                </div>
              </div>
              <div className="view-group">
                <span className="view-icon">
                  <Calendar/>
                </span>
                <div>
                  <p>{"Créé le"}</p>
                  <p className="font-semibold">{format(new Date(purchaseOrder.createdAt), "dd LLLL yyyy")}</p>
                </div>
              </div>
            </section>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant={"outline"}>{"Fermer"}</Button>
              </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}

export default ViewPurchase