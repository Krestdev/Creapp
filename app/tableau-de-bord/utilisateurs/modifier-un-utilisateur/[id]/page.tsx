// app/tableau-de-bord/utilisateurs/modifier-un-utilisateur/[id]/page.tsx

import UpdateUser from "@/components/Users/UpdateUser";
import { users } from "@/lib/data";



interface Props {
  params: { id: string };
}

const UpdateUserPage = async ({ params }: Props) => {
  const userId = Number(params.id);
  const user = users.find((x) => x.id === userId);

  if (!user) {
    return <div>Utilisateur introuvable</div>; 
  }

  return (
    <div>
      <UpdateUser user={user} />
    </div>
  );
};

export default UpdateUserPage;
