"use client";

import axios from "axios";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MyRecipesFormSkeleton } from "@/components/ui/page-skeletons";
import type { ParsedRecipe } from "@/lib/recipe-parser";

type Props = {
  onManual: () => void;
  onFetched: (data: ParsedRecipe) => void;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function StepSource({ onManual, onFetched }: Props) {
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  if (loading) {
    return <MyRecipesFormSkeleton />;
  }
  /* ---------------- URL FLOW ---------------- */

  const fetchFromUrl = async () => {
    if (!url || loading) return;

    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(
        "/api/recipes/parse-url",
        { url },
        { headers: { "Content-Type": "application/json" } }
      );

      if (!data?.recipe) throw new Error();
      onFetched(data.recipe);
    } catch {
      setError("Failed to fetch recipe from URL");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FILE FLOW ---------------- */

  const fetchFromFile = async () => {
    if (!file || loading) return;

    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be 10 MB or less");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await axios.post(
        "/api/recipes/parse-image-pdf",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (!data?.recipe) throw new Error();
      onFetched(data.recipe);
    } catch {
      setError("Failed to parse recipe from file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Add Recipe</h1>

      {/* Manual */}
      <Button
        className="w-full"
        onClick={onManual}
        disabled={loading}
        data-tour="add-recipe-manual"
      >
        Add recipe manually
      </Button>

      {/* URL */}
      <div className="space-y-2 rounded-lg border p-4">
        <Input
          placeholder="Paste recipe URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />

        <Button
          className="w-full"
          onClick={fetchFromUrl}
          disabled={loading || !url}
        >
          {loading ? "Fetching recipe..." : "Fetch from URL"}
        </Button>
      </div>

      {/* PDF / IMAGE */}
      <div className="space-y-3 rounded-lg border p-4">
        <Input
          type="file"
          accept="image/png,image/jpeg,image/jpg,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          disabled={loading}
        />

        <p className="text-muted-foreground text-xs">
          PNG, JPG, JPEG, or PDF · Max size 10 MB
        </p>

        <Button
          className="w-full"
          onClick={fetchFromFile}
          disabled={loading || !file}
        >
          {loading ? "Parsing recipe..." : "Upload & Parse"}
        </Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
