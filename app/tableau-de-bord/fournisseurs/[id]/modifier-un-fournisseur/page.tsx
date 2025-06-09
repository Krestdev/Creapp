// app/tableau-de-bord/utilisateurs/modifier-un-utilisateur/[id]/page.tsx

import EditFournisseur from "@/components/Fournisseurs/EditFournisseur";
import { fournisseurs } from "@/lib/data";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {

  const { id } = await params

  return {
    title: `Modifier l'utilisateur ${id}`,
  };
}

const UpdateFournisseurPage = async ({ params }: Readonly<{
  params: Promise<{ id: string }>;
}>) => {
  const fournisseurId = Number((await params).id);
  const fournisseur = fournisseurs.find((x) => x.id === fournisseurId);

  if (!fournisseur) {
    return <div>Fournisseur introuvable</div>;
  }

  return (
    <div className='flex flex-col gap-14 px-7 py-6'>
      <div className='flex flex-col gap-2 items-center w-full'>
        <h1>{"Modifier un fournisseur"}</h1>
        <p className='text-[#A1A1A1] font-normal text-[16px]'>{"Mettez à jour les informations concernant ce fournisseur"}</p>
      </div>
      <EditFournisseur fournisseur={fournisseur} />
    </div>
  );
};

export default UpdateFournisseurPage;