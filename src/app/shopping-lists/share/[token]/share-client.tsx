"use client";

import { ShareListSkeleton } from "@/components/ui/page-skeletons";
import { AggregatedItem as Item } from "@/types/aggregatedItems";

type Props = {
  data: {
    title: string;
    groups: Record<string, Item[]>;
  };
};

export default function ShareClient({ data }: Props) {
  if (!data) {
    return <ShareListSkeleton />;
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">{data.title}</h1>

      {Object.entries(data.groups).map(([category, items]) => (
        <div key={category} className="mb-6">
          <h2 className="mb-2 border-b font-semibold">{category}</h2>
          <ul className="space-y-1">
            {items.map((i) => (
              <li key={i.name} className="text-sm">
                {i.isChecked ? "☑" : "☐"} {i.quantity.toFixed(2)} {i.unit}{" "}
                {i.name}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
