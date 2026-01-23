"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { RecipeCard } from "./recipe-card";
import type { Recipe } from "@/types/recipe";

type Props = {
  recipe: Recipe;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onCardClick: (recipe: Recipe) => void;
};

export function SelectableRecipeCard({ recipe, selected, onSelect, onCardClick }: Props) {
  const onClick = () => {
    onCardClick(recipe);
  }
  return (
    <div className="relative flex gap-3">
      {/* Checkbox */}
      <Checkbox
        checked={selected}
        onCheckedChange={(v) => onSelect(Boolean(v))}
        className="mt-4"
      />

      {/* Existing card */}
      <div className="flex-1">
        <RecipeCard recipe={recipe} onClick={onClick} />
      </div>
    </div>
  );
}
