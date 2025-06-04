// app/tableau-de-bord/utilisateurs/modifier-un-utilisateur/[id]/page.tsx

import { department } from "@/lib/data";
import { Metadata } from "next";
import Detail from "./detail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {

  const { id } = await params

  return {
    title: `Details du service ${id}`,
  };
}

const UserDetailPage = async ({ params }: Readonly<{
  params: Promise<{ id: string }>;
}>) => {
  const departId = Number((await params).id);
  const departement = department.find((x) => x.id === departId);

  if (!departement) {
    return <div>departement introuvable</div>;
  }

  return (
    <div>
      <Detail depart={departement} />
    </div>
  );
};

export default UserDetailPage;