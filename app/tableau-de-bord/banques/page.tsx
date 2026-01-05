'use client'
import PageTitle from '@/components/pageTitle'
import { Button } from '@/components/ui/button';
import { cn, isRole } from '@/lib/utils';
import { useStore } from '@/providers/datastore';
import { Bank, NavLink } from '@/types/types';
import Link from 'next/link';
import React from 'react'
import { BankTable } from './bank-table';

function Page() {
  const { user } = useStore();
  const auth = isRole({roleList: user?.role ?? [], role: "trésorier"});
  const links: Array<NavLink> = [
    {
      title: "Ajouter un compte",
      href: "./banques/creer",
      hide: !auth,
    }
  ];

  const banksMock: Bank[] = [
  {
    id: 1,
    label: "UBA Cameroun",
    type: "BANK",
    balance: 63484234,
    justification: "Compte principal de l'entreprise",
    accountNumber: "00123456789",
    bankCode: "UBA-CM",
    key: "001",
    createdAt: new Date("2024-12-10T10:35:00"),
    updatedAt: new Date("2024-12-22T10:35:00"),
  },
  {
    id: 2,
    label: "Afriland First Bank",
    type: "BANK",
    balance: 2021966,
    justification: "Compte secondaire pour paiements fournisseurs",
    accountNumber: "98765432100",
    bankCode: "AFB-CM",
    key: "002",
    createdAt: new Date("2024-11-18T20:11:00"),
    updatedAt: new Date("2024-12-21T20:11:00"),
  },
  {
    id: 3,
    label: "Caisse Générale",
    type: "CASH",
    balance: 95600,
    justification: "Caisse pour dépenses courantes",
    createdAt: new Date("2024-12-01T18:23:00"),
    updatedAt: new Date("2024-12-22T18:23:00"),
  },
  {
    id: 4,
    label: "Orange Money Pro",
    type: "MOBILE_WALLET",
    balance: 891025,
    justification: "Portefeuille mobile pour encaissements clients",
    phoneNum: "699123456",
    merchantNum: "OM-8899",
    createdAt: new Date("2024-12-05T09:47:00"),
    updatedAt: new Date("2024-12-22T09:47:00"),
  },
  {
    id: 5,
    label: "MTN MoMo Business",
    type: "MOBILE_WALLET",
    balance: 42550,
    justification: "Paiements rapides et transferts internes",
    phoneNum: "677987654",
    merchantNum: "MTN-5566",
    createdAt: new Date("2024-12-15T14:58:00"),
    updatedAt: new Date("2024-12-22T14:58:00"),
  },
];
  return (
    <div className='content'>
      <PageTitle title='Banques' subtitle="Liste des comptes">
        {links
            .filter((x) => (!x.hide ? true : x.hide === true && false))
            .map((link, id) => {
              const isLast = links.length > 1 ? id === links.length - 1 : false;
              return (
                <Link
                  key={id}
                  href={link.href}
                  onClick={(e) => {
                    link.disabled && e.preventDefault();
                  }}
                  className={cn(link.disabled && "cursor-not-allowed")}
                >
                  <Button
                    size={"lg"}
                    variant={isLast ? "accent" : "ghost"}
                    disabled={link.disabled}
                  >
                    {link.title}
                  </Button>
                </Link>
              );
            })}
      </PageTitle>
      <BankTable data={banksMock}/>
    </div>
  )
}

export default Page