// app/tableau-de-bord/utilisateurs/modifier-un-utilisateur/[id]/page.tsx

import UpdateServices from "@/components/Organisation/Services/UpdateService";
import { services } from "@/lib/data";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {

  const { id } = await params

  return {
    title: `Modifier l'utilisateur ${id}`,
  };
}

const UpdateServicePage = async ({ params }: Readonly<{
  params: Promise<{ id: string }>;
}>) => {
  const serviceId = Number((await params).id);
  const service = services.find((x) => x.id === serviceId);

  if (!service) {
    return <div>Utilisateur introuvable</div>;
  }

  return (
    <div className='flex flex-col gap-14 px-7 py-6'>
      <div className='flex flex-col gap-2 items-center w-full'>
        <h1>{"Modifier un Service"}</h1>
        <p className='text-[#A1A1A1] font-normal text-[16px]'>{"Mettez à jour les informations concernant ce service"}</p>
      </div>
      <UpdateServices service={service} />
    </div>
  );
};

export default UpdateServicePage;