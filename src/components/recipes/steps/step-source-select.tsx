"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  onManual: () => void;
  onFetched: (data: any) => void;
};

export function StepSource({ onManual, onFetched }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchFromUrl = async () => {
    if (!url) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/recipes/parse-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const json = await res.json();

      if (!json.success) throw new Error();

      onFetched(json.recipe);
    } catch {
      setError("Failed to fetch recipe from URL");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Add Recipe</h1>

      {/* Manual */}
      <Button className="w-full" onClick={onManual}>
        Add recipe manually
      </Button>

      {/* URL */}
      <div className="space-y-2 rounded-lg border p-4">
        <Input
          placeholder="Paste recipe URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <Button
          className="w-full"
          onClick={fetchFromUrl}
          disabled={loading}
        >
          {loading ? "Fetching recipe..." : "Fetch from URL"}
        </Button>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
