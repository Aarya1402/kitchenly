"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ParsedRecipe } from "@/lib/recipe-parser";
import axios from "axios";

type Props = {
  onManual: () => void;
  onFetched: (data: ParsedRecipe) => void;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function StepSource({ onManual, onFetched }: Props) {
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [urlLoading, setUrlLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);

  const [error, setError] = useState("");

  /* ---------------- URL FLOW ---------------- */

  const fetchFromUrl = async () => {
    if (!url || urlLoading) return;

    setUrlLoading(true);
    setError("");

    try {
      const { data } = await axios.post(
        "/api/recipes/parse-url",
        { url },
        { headers: { "Content-Type": "application/json" } },
      );

      if (!data?.recipe) throw new Error();
      onFetched(data.recipe);
    } catch {
      setError("Failed to fetch recipe from URL");
    } finally {
      setUrlLoading(false);
    }
  };

  /* ---------------- FILE FLOW ---------------- */

  const fetchFromFile = async () => {
    if (!file || fileLoading) return;

    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be 10 MB or less");
      return;
    }

    setFileLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await axios.post(
        "/api/recipes/parse-image-pdf",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (!data?.recipe) throw new Error();
      onFetched(data.recipe);
    } catch {
      setError("Failed to parse recipe from file");
    } finally {
      setFileLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Add Recipe</h1>

      {/* Manual */}
      <Button
        className="w-full"
        onClick={onManual}
        disabled={urlLoading || fileLoading}
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
          disabled={urlLoading}
        />

        <Button className="w-full" onClick={fetchFromUrl} disabled={urlLoading || !url}>
          {urlLoading ? "Fetching recipe..." : "Fetch from URL"}
        </Button>
      </div>

      {/* PDF / IMAGE */}
      <div className="space-y-3 rounded-lg border p-4">
        <Input
          type="file"
          accept="image/png,image/jpeg,image/jpg,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          disabled={fileLoading}
        />

        <p className="text-xs text-muted-foreground">
          PNG, JPG, JPEG, or PDF · Max size 10 MB
        </p>

        <Button
          className="w-full"
          onClick={fetchFromFile}
          disabled={fileLoading || !file}
        >
          {fileLoading ? "Parsing recipe..." : "Upload & Parse"}
        </Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
