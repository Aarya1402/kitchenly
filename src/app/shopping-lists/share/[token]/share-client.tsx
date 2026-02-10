// src/app/share/[token]/share-client.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { AggregatedItem as Item } from "@/types/aggregatedItems";
import { ShareListSkeleton } from "@/components/ui/page-skeletons";

export default function ShareClient({ token }: { token: string }) {
  const [data, setData] = useState<{
    title: string;
    groups: Record<string, Item[]>;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    axios
      .get(`/api/share/shopping-lists/${token}`)
      .then((response) => {
        setData(response.data);
      })

      .catch((e) => setError(e.message));
  }, [token]);

  if (!token) {
    return <div className="p-8">Invalid share link</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  if (!data) {
    return <ShareListSkeleton/>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{data.title}</h1>

      {Object.entries(data.groups).map(([category, items]) => (
        <div key={category} className="mb-6">
          <h2 className="font-semibold border-b mb-2">{category}</h2>
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
