"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DIETARY_PREFERENCES as PRESET_TAGS } from "@/constants/dietary-preferences";
import { useState } from "react";
type Props = {
  title: string;
  setTitle: (v: string) => void;

  description: string;
  setDescription: (v: string) => void;

  servings: number;
  setServings: (v: number) => void;

  dietaryTags: string[];
  setDietaryTags: (v: string[]) => void;

  setImageFile: (f: File | null) => void;
  mode: "create" | "edit";
  cuisine: string | null;
  setCuisine: (v: string) => void;
};

export function RecipeBasicsCard({
  title,
  setTitle,
  description,
  setDescription,
  servings,
  setServings,
  dietaryTags,
  setDietaryTags,
  setImageFile,
  mode,
  cuisine,
  setCuisine,
}: Props) {
  const toggleTag = (tag: string) => {
    setDietaryTags(
      dietaryTags.includes(tag)
        ? dietaryTags.filter((t) => t !== tag)
        : [...dietaryTags, tag]
    );
  };
  const [customTags, setCustomTags] = useState<{ id: string; label: string }[]>(
    []
  );
  const [inputValue, setInputValue] = useState("");
  const addCustomTag = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Avoid duplicates
    if (
      !PRESET_TAGS.some((t) => t.id === trimmed) &&
      !customTags.some((t) => t.id === trimmed)
    ) {
      setCustomTags([...customTags, { id: trimmed, label: trimmed }]);
    }

    // Select the new tag
    if (!dietaryTags.includes(trimmed)) {
      setDietaryTags([...dietaryTags, trimmed]);
    }

    setInputValue("");
  };

  // Merge preset and custom tags for display
  const allTags = [...PRESET_TAGS, ...customTags];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recipe Basics</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Title */}
        <Input
          placeholder="Recipe title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Description */}
        <Textarea
          placeholder="Short description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Servings */}
        <Input
          type="number"
          min={1}
          placeholder="Servings"
          value={servings}
          onChange={(e) => setServings(Number(e.target.value))}
          className="w-32"
          disabled={mode === "edit"}
        />
        <Input
          type="text"
          placeholder="Cuisine"
          value={cuisine || ""}
          onChange={(e) => setCuisine(e.target.value)}
        />

        {/* Dietary Tags */}
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <Badge
              key={tag.id}
              variant={dietaryTags.includes(tag.id) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleTag(tag.id)}
            >
              {tag.label}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Add custom tag"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 rounded border px-2 py-1"
            onKeyDown={(e) => e.key === "Enter" && addCustomTag()}
          />
          <Button
            type="button"
            onClick={addCustomTag}
            disabled={!inputValue.trim()}
          >
            Add
          </Button>
        </div>

        {/* Image Upload */}
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
        />
      </CardContent>
    </Card>
  );
}
