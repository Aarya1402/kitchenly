export default async function PublicShoppingListPage({
  params,
}: {
  params: { token: string };
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/share/shopping-lists/${params.token}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    return <div className="p-6">Link expired</div>;
  }
  console.log(res);
  const data = await res.json();

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-xl font-semibold">{data.title}</h1>

      {data.items.map((item: any, i: number) => (
        <div key={i} className="flex gap-2">
          <input type="checkbox" />
          <span>
            {item.quantity} {item.name}
          </span>
        </div>
      ))}

      <p className="text-xs text-muted-foreground">
        This is a read-only shared list
      </p>
    </div>
  );
}
