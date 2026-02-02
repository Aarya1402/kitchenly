import axios from "axios";

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
let data= null;
 
try {
  const res = await axios.get(
    `http://192.168.24.68:3000/api/share/shopping-lists/${token}`,
    {
      // Axios doesn't have `cache: "no-store"` like fetch;
      // if needed, we can add headers to prevent caching
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );

   data = res.data as PublicShoppingListResponse;
} catch (error) {
  return <div className="p-6">Link expired</div>;
}

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-xl font-semibold">{data.title}</h1>

      {Object.entries(data.groups).map(([category, items]) => (
        <div key={category} className="space-y-2">
          <h2 className="font-medium font-strong-700">{category}</h2>

          {items.map((item) => (
            <div key={item.ingredientKey} className="flex gap-2">
              <input type="checkbox" disabled checked={item.isChecked} />
              <span className="font-small">
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
