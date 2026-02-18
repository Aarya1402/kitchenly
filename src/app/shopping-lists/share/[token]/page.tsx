import { notFound } from "next/navigation";

import { getSharedShoppingList } from "@/app/shopping-lists/actions";

import ShareClient from "./share-client";

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await getSharedShoppingList(token);

  if (!data) {
    notFound();
  }
  return <ShareClient data={data} />;
}
