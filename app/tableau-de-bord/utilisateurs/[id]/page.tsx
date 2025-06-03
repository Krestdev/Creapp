// app/tableau-de-bord/utilisateurs/modifier-un-utilisateur/[id]/page.tsx

import { users } from "@/lib/data";
import { Metadata } from "next";
import Detail from "./detail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {

  const { id } = await params

  return {
    title: `Details de l'utilisateur ${id}`,
  };
}

const UserDetailPage = async ({ params }: Readonly<{
  params: Promise<{ id: string }>;
}>) => {
  const userId = Number((await params).id);
  const user = users.find((x) => x.id === userId);

  if (!user) {
    return <div>Utilisateur introuvable</div>;
  }

  return (
    <div>
      <Detail user={user} />
    </div>
  );
};

export default UserDetailPage;