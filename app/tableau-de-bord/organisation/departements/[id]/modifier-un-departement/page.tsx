// app/tableau-de-bord/utilisateurs/modifier-un-utilisateur/[id]/page.tsx

import UpdateDepartment from "@/components/Organisation/Departement/UpdateDepartment";
import UpdateServices from "@/components/Organisation/Services/UpdateService";
import { department, services } from "@/lib/data";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {

  const { id } = await params

  return {
    title: `Modifier l'utilisateur ${id}`,
  };
}

const UpdateDepartPage = async ({ params }: Readonly<{
  params: Promise<{ id: string }>;
}>) => {
  const departId = Number((await params).id);
  const depart = department.find((x) => x.id === departId);

  if (!department) {
    return <div>Utilisateur introuvable</div>;
  }

  return (
    <div className='flex flex-col gap-14 px-7 py-6'>
      <div className='flex flex-col gap-2 items-center w-full'>
        <h1>{"Modifier un département"}</h1>
        <p className='text-[#A1A1A1] font-normal text-[16px]'>{"Mettez à jour les informations concernant ce département"}</p>
      </div>
      <UpdateDepartment depart={depart} />
    </div>
  );
};

export default UpdateDepartPage;