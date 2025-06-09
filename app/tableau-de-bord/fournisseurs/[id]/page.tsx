import FournisseurDetail from '@/components/Fournisseurs/FournisseurDetail'
import { fournisseurs } from '@/lib/data';
import { Metadata } from 'next';
import React from 'react'


export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {

  const { id } = await params

  return {
    title: `Details du service ${id}`,
  };
}

const DatailFournPage = async ({ params }: Readonly<{
  params: Promise<{ id: string }>;
}>) => {
  const fournisseurName = (await params).id;
  const fournisseur = fournisseurs.find((x) => x.name === decodeURIComponent(fournisseurName));

  if (!fournisseur) {
    return <div>Service introuvable</div>;
  }
    return (
        <div>
            <FournisseurDetail fournisseur={fournisseur} />
        </div>
    )
}

export default DatailFournPage
