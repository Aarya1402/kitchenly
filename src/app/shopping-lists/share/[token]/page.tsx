type PublicListItem = {
  ingredientKey: string;
  name: string;
  quantity: string;
  category: string;
  unit:string
  isChecked: boolean;
};

type PublicShoppingListResponse = {
  title: string;
  groups: Record<string, PublicListItem[]>;
};
export default async function PublicShoppingListPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params; 

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/share/shopping-lists/${token}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    return <div className="p-6">Link expired</div>;
  }
  console.log(res);
  const data = (await res.json()) as PublicShoppingListResponse;

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-xl font-semibold">{data.title}</h1>

      {Object.entries(data.groups).map(([category, items]) => (
        <div key={category} className="space-y-2">
          <h2 className="font-medium">{category}</h2>

          {items.map((item) => (
            <div key={item.ingredientKey} className="flex gap-2">
              <input type="checkbox" disabled checked={item.isChecked} />
              <span>
                {item.quantity} {item.unit} {item.name}
              </span>
            </div>
          ))}
        </div>
      ))}

      <p className="text-xs text-muted-foreground">
        This is a read-only shared list
      </p>
    </div>
  );
}
