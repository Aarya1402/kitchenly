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
import { useState, useEffect } from "react";
import type { Recipe } from "@/types/recipe";
import { Input } from "@/components/ui/input";

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

  function parseQuantity(input: string) {
    const match = input.trim().match(/^([\d.]+)\s*(.*)$/);
    if (!match) return null;

    return {
      value: Number(match[1]),
      unit: match[2] || "",
    };
  }

  function scaleQuantity(quantity: string, factor: number): string {
    const parsed = parseQuantity(quantity);
    if (!parsed) return quantity;

    const scaled = parsed.value * factor;

    // clean formatting (2 decimal max)
    const display = Math.round(scaled * 100) / 100;

    return `${display} ${parsed.unit}`.trim();
  }

  /* ───────── component ───────── */

  type Props = {
    recipe: Recipe | null;
    open: boolean;
    onClose: () => void;
  };

  const originalServings = recipe?.servings ?? 1;

  const [servings, setServings] = useState(originalServings);

  // reset servings when modal opens/closes
  useEffect(() => {
    if (open && recipe) {
      setServings(recipe.servings);
    }
  }, [open, recipe]);

  if (!recipe) return null;

  const scaleFactor = servings / originalServings;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col">
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
          <div className="flex flex-wrap items-center gap-4">
            <Badge>{recipe.cuisine}</Badge>
            <Badge>Original: {originalServings} servings</Badge>

            <div className="flex items-center gap-2">
              <span className="text-sm">Servings</span>
              <Input
                type="number"
                min={1}
                value={servings}
                autoFocus={false}
                onChange={(e) =>
                  setServings(Math.max(1, Number(e.target.value)))
                }
                className="w-20"
              />
            </div>

            {recipe.dietaryTags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
            
          </div>
          <div>
            <p className="text-sm">{recipe.description}</p>
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="font-medium mb-1">Ingredients</h3>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {recipe.ingredients.map((i) => (
                <li key={i.name}>
                  {scaleQuantity(i.quantity, scaleFactor)} {i.name}
                </li>
              ))}
            </ul>

            {recipe.ingredients.length > INGREDIENTS_PREVIEW_COUNT && (
              <Button
                variant="link"
                className="px-0 mt-1 font-bold"
                onClick={() => setShowAllIngredients((v) => !v)}
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
                className="px-0 mt-1 font-bold"
                onClick={() => setShowAllSteps((v) => !v)}
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
            onClick={() => router.push(`/my-recipes/${recipe.id}/edit`)}
          >
            Edit
          </Button>

          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
