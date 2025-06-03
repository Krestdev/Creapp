// app/tableau-de-bord/utilisateurs/modifier-un-utilisateur/[id]/page.tsx

import SetPassword from "@/components/Users/SetPassword";
import UpdateUser from "@/components/Users/UpdateUser";
import { users } from "@/lib/data";



interface Props {
  params: { id: string };
}

const PasswordPage = async ({ params }: Props) => {
  const userId = Number(params.id);
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

export default PasswordPage;
