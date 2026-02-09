"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { RecipeCard } from "./recipe-card";
import type { Recipe } from "@/types/recipe";

type Props = {
  recipe: Recipe;
  selected: boolean;
  currentUserId?: string | null;
  onSelect: (checked: boolean) => void;
  onCardClick: (recipe: Recipe) => void;
};

export function SelectableRecipeCard({
  recipe,
  selected,
  currentUserId,
  onSelect,
  onCardClick,
}: Props) {
  const onClick = () => {
    onCardClick(recipe);
  };
  return (
    <div className="relative flex gap-3">
      {/* Checkbox */}
      <Checkbox
        checked={selected}
        onCheckedChange={(v) => onSelect(Boolean(v))}
        className="mt-4"
        data-tour="recipe-select-checkbox"
      />

      {/* Existing card */}
      <div className="flex-1">
        <div data-tour="recipe-card">
          <RecipeCard
            recipe={recipe}
            currentUserId={currentUserId}
            onClick={onClick}
          />
        </div>
      </div>
    </div>
  );
}
