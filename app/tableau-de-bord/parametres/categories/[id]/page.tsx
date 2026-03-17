import UpdateCategory from "./update-category";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UpdateCategory id={Number(id)} />;
}
