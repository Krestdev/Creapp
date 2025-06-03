// app/tableau-de-bord/utilisateurs/modifier-un-utilisateur/[id]/page.tsx

import SetPassword from "@/components/Users/SetPassword";
import UpdateUser from "@/components/Users/UpdateUser";
import { users } from "@/lib/data";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {

  const { id } = await params

  return {
    title: `Modifier l'utilisateur ${id}`,
  };
}

const UpdateUserPage = async ({ params }: Readonly<{
  params: Promise<{ id: string }>;
}>) => {
  const userId = Number((await params).id);
  const user = users.find((x) => x.id === userId);

  if (!user) {
    return <div>Utilisateur introuvable</div>;
  }

  return (
    <div>
      <SetPassword userId={user.id} />
    </div>
  );
};

export default UpdateUserPage;