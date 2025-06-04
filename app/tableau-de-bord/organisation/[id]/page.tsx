// app/tableau-de-bord/utilisateurs/modifier-un-utilisateur/[id]/page.tsx

import { services, users } from "@/lib/data";
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
  const serviceId = Number((await params).id);
  const service = services.find((x) => x.id === serviceId);

  if (!service) {
    return <div>Service introuvable</div>;
  }

  return (
    <div>
      <Detail service={service} />
    </div>
  );
};

export default UserDetailPage;