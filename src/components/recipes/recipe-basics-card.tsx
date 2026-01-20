"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const PRESET_TAGS = [
  "vegetarian",
  "vegan",
  "gluten-free",
  "dairy-free",
  "eggless",
];

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
}: Props) {
  const toggleTag = (tag: string) => {
    setDietaryTags(
      dietaryTags.includes(tag)
        ? dietaryTags.filter((t) => t !== tag)
        : [...dietaryTags, tag],
    );
  };

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
        />

        {/* Dietary Tags */}
        <div className="flex flex-wrap gap-2">
          {PRESET_TAGS.map((tag) => (
            <Badge
              key={tag}
              variant={dietaryTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
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
