"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Recipe } from "@/types/recipe";

type Props = {
  recipe: Recipe | null;
  open: boolean;
  onClose: () => void;
  onDeleted: (recipe: Recipe) => void;
};

const INGREDIENTS_PREVIEW_COUNT = 5;
const STEPS_PREVIEW_COUNT = 3;

export function RecipeDetailsModal({
  recipe,
  open,
  onClose,
  onDeleted,
}: Props) {
  const router = useRouter();

  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const [showAllSteps, setShowAllSteps] = useState(false);

  if (!recipe) return null;

  const handleDelete = () => {
    onDeleted(recipe);
  };

  const ingredientsToShow = showAllIngredients
    ? recipe.ingredients
    : recipe.ingredients.slice(0, INGREDIENTS_PREVIEW_COUNT);

  const stepsToShow = showAllSteps
    ? recipe.steps
    : recipe.steps.slice(0, STEPS_PREVIEW_COUNT);

  return (
<Dialog open={open} onOpenChange={onClose}>
  <DialogContent
    className="max-w-3xl h-[85vh] flex flex-col"
  >
    {/* HEADER (fixed) */}
    <DialogHeader>
      <DialogTitle>{recipe.title}</DialogTitle>
    </DialogHeader>

    {/* SCROLLABLE BODY */}
    <div className="flex-1 overflow-y-auto space-y-6 pr-2">
      {/* Image */}
      {recipe.imageUrl && (
        <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-2">
        <Badge>Servings: {recipe.servings}</Badge>
        {recipe.dietaryTags.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Ingredients */}
      <div>
        <h3 className="font-medium mb-1">Ingredients</h3>
        <ul className="list-disc pl-5 text-sm space-y-1">
          {ingredientsToShow.map((i, idx) => (
            <li key={idx}>
              {i.quantity} {i.name}
            </li>
          ))}
        </ul>

        {recipe.ingredients.length > INGREDIENTS_PREVIEW_COUNT && (
          <Button
            variant="link"
            className="px-0 mt-1"
            onClick={() =>
              setShowAllIngredients((v) => !v)
            }
          >
            {showAllIngredients ? "Show less" : "Show more"}
          </Button>
        )}
      </div>

      {/* Steps */}
      <div>
        <h3 className="font-medium mb-1">Steps</h3>
        <ol className="list-decimal pl-5 text-sm space-y-1">
          {stepsToShow.map((s) => (
            <li key={s.stepNo}>{s.content}</li>
          ))}
        </ol>

        {recipe.steps.length > STEPS_PREVIEW_COUNT && (
          <Button
            variant="link"
            className="px-0 mt-1"
            onClick={() =>
              setShowAllSteps((v) => !v)
            }
          >
            {showAllSteps ? "Show less" : "Show more"}
          </Button>
        )}
      </div>
    </div>

    {/* FOOTER (fixed) */}
    <DialogFooter className="flex justify-between">
      <Button
        variant="outline"
        onClick={() =>
          router.push(`/recipes/${recipe.id}/edit`)
        }
      >
        Edit
      </Button>

      <Button
        variant="destructive"
        onClick={handleDelete}
      >
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

  );
}
