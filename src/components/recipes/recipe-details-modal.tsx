"use client";

import "./scrollbar-hide.css";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getTastePreview, translateRecipe } from "@/app/recipes/actions";
import { Activity } from "@/components/ui/activity";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { INGREDIENTS_PREVIEW_COUNT } from "@/constants/ingredients-preview-count";
import { STEPS_PREVIEW_COUNT } from "@/constants/steps-preview-count";
import { SUPPORTED_LANGUAGES } from "@/constants/supported-languages";
import type { Recipe } from "@/types/recipe";
import { TastePreview } from "@/types/tastePreview";
type Props = {
  recipe: Recipe | null;
  open: boolean;
  onClose: () => void;
  onDeleted: (recipe: Recipe) => void;
  currentUserId?: string | null;
};

export function RecipeDetailsModal({
  recipe,
  open,
  onClose,
  onDeleted,
  currentUserId,
}: Props) {
  const router = useRouter();

  const [language, setLanguage] = useState("English");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedData, setTranslatedData] = useState<{
    title: string;
    description: string | null;
    ingredients: { name: string; quantity: string }[];
    steps: string[];
    cuisine: string | null;
    language: string;
  } | null>(null);

  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [tasteOpen, setTasteOpen] = useState(false);
  const [tasteLoading, setTasteLoading] = useState(false);
  const [tasteResult, setTasteResult] = useState<TastePreview | null>(null);

  const originalServings = recipe?.servings ?? 1;
  const [servings, setServings] = useState(originalServings);

  // reset servings and language when modal opens/closes
  useEffect(() => {
    if (open && recipe) {
      setServings(recipe.servings);
      setLanguage("English");
      setTranslatedData(null);
    }
  }, [open, recipe]);

  const handleLanguageChange = async (val: string) => {
    if (!recipe) return;
    if (val === "English") {
      setLanguage("English");
      return;
    }

    setLanguage(val);

    if (translatedData?.language === val) return;

    setIsTranslating(true);
    try {
      const result = await translateRecipe({
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        cuisine: recipe.cuisine,
        language: val,
      });
      setTranslatedData({ ...result, language: val });
    } catch {
      toast.error("Translation failed");
      setLanguage("English");
    } finally {
      setIsTranslating(false);
    }
  };

  if (!recipe) return null;

  const isOwnRecipe = currentUserId && recipe.userId === currentUserId;

  const handleDelete = async () => {
    await onDeleted(recipe);
  };

  const isTranslated =
    language !== "English" && translatedData?.language === language;

  const displayTitle = isTranslated ? translatedData!.title : recipe.title;
  const displayDescription = isTranslated
    ? translatedData!.description
    : recipe.description;
  const displayCuisine = isTranslated
    ? translatedData!.cuisine
    : recipe.cuisine;

  const ingredientsSource = isTranslated
    ? translatedData!.ingredients
    : recipe.ingredients;

  const ingredientsToShow = showAllIngredients
    ? ingredientsSource
    : ingredientsSource.slice(0, INGREDIENTS_PREVIEW_COUNT);

  const stepsSource = isTranslated
    ? translatedData!.steps.map((s, i) => ({ stepNo: i + 1, content: s }))
    : recipe.steps;

  const stepsToShow = showAllSteps
    ? stepsSource
    : stepsSource.slice(0, STEPS_PREVIEW_COUNT);

  function parseQuantity(input: string) {
    const match = input.trim().match(/^([\d.]+)\s*(.*)$/);
    if (!match) return null;

    return {
      value: Number(match[1]),
      unit: match[2] || "",
    };
  }
  const handleTastePreview = async () => {
    setTasteOpen(true);
    setTasteLoading(true);
    setTasteResult(null);

    try {
      const result = await getTastePreview({
        title: recipe.title,
        ingredients: recipe.ingredients,
        steps: recipe.steps.map((s) => s.content),
      });

      setTasteResult(result);
    } catch (err) {
      console.error("Taste preview error:", err);
      setTasteResult(null);
    } finally {
      setTasteLoading(false);
    }
  };

  function scaleQuantity(quantity: string, factor: number): string {
    const parsed = parseQuantity(quantity);
    if (!parsed) return quantity;

    const scaled = parsed.value * factor;

    // clean formatting (2 decimal max)
    const display = Math.round(scaled * 100) / 100;

    return `${display} ${parsed.unit}`.trim();
  }

  const scaleFactor = servings / originalServings;
  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <Activity visible={open} name="recipe-details-content">
          <DialogContent className="flex h-[85vh] max-w-3xl flex-col">
            {/* HEADER (fixed) */}
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <DialogTitle className="flex-1">{displayTitle}</DialogTitle>
                <Select
                  value={language}
                  onValueChange={handleLanguageChange}
                  disabled={isTranslating}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </DialogHeader>

            {/* SCROLLABLE BODY */}
            <div className="scrollbar-hide flex-1 space-y-6 overflow-y-auto pr-4">
              <div className="from-background pointer-events-none sticky top-0 h-4 bg-gradient-to-b to-transparent" />
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
                <Badge>{displayCuisine}</Badge>
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
                <p className="text-sm">{displayDescription}</p>
              </div>

              {/* Ingredients */}
              <div>
                <h3 className="mb-1 font-medium">Ingredients</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {ingredientsToShow.map((i, index) => (
                    <li key={`ingredient-${index}`}>
                      {scaleQuantity(i.quantity, scaleFactor)} {i.name}
                    </li>
                  ))}
                </ul>

                {ingredientsSource.length > INGREDIENTS_PREVIEW_COUNT && (
                  <Button
                    variant="link"
                    className="mt-1 px-0 font-bold"
                    onClick={() => setShowAllIngredients((v) => !v)}
                  >
                    {showAllIngredients ? "Show less" : "Show more"}
                  </Button>
                )}
              </div>

              {/* Steps */}
              <div>
                <h3 className="mb-1 font-medium">Steps</h3>
                <ol className="list-decimal space-y-1 pl-5 text-sm">
                  {stepsToShow.map((s) => (
                    <li key={s.stepNo}>{s.content}</li>
                  ))}
                </ol>

                {stepsSource.length > STEPS_PREVIEW_COUNT && (
                  <Button
                    variant="link"
                    className="mt-1 px-0 font-bold"
                    onClick={() => setShowAllSteps((v) => !v)}
                  >
                    {showAllSteps ? "Show less" : "Show more"}
                  </Button>
                )}
              </div>
              <div className="from-background pointer-events-none sticky bottom-0 h-4 bg-gradient-to-t to-transparent" />
            </div>

            {/* FOOTER (fixed) */}
            <DialogFooter className="flex justify-between">
              <Button variant="secondary" onClick={handleTastePreview}>
                ✨ Taste Preview
              </Button>

              {isOwnRecipe && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/recipes/${recipe.id}/edit`)}
                  >
                    Edit
                  </Button>

                  <Button variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Activity>
      </Dialog>
      <Dialog open={tasteOpen} onOpenChange={setTasteOpen}>
        <Activity visible={tasteOpen} name="taste-preview-modal">
          <DialogContent className="max-w-lg overflow-hidden">
            <div className="from-background pointer-events-none sticky bottom-0 h-4 bg-gradient-to-t to-transparent" />
            <DialogHeader>
              <DialogTitle>Taste Preview — {recipe.title}</DialogTitle>
            </DialogHeader>

            {/* BODY */}
            <div className="scrollbar-hide space-y-4">
              {tasteLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              ) : (
                tasteResult && (
                  <>
                    {/* Meta badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        🌶️ {tasteResult.spiceLevel}
                      </Badge>
                      <Badge variant="outline">🧈 {tasteResult.richness}</Badge>
                    </div>

                    {/* Overall taste */}
                    <div>
                      <h4 className="mb-1 text-sm font-semibold">
                        Overall Taste
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {tasteResult.overallTaste}
                      </p>
                    </div>

                    {/* Dominant flavors */}
                    <div>
                      <h4 className="mb-1 text-sm font-semibold">
                        Dominant Flavors
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {tasteResult.dominantFlavors.map((f) => (
                          <Badge key={f} variant="secondary">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Best for */}
                    <div>
                      <h4 className="mb-1 text-sm font-semibold">Best For</h4>
                      <p className="text-muted-foreground text-sm">
                        {tasteResult.bestFor}
                      </p>
                    </div>
                  </>
                )
              )}
            </div>

            {/* FOOTER */}
            <DialogFooter>
              <Button variant="outline" onClick={() => setTasteOpen(false)}>
                Close
              </Button>
            </DialogFooter>
            <div className="from-background pointer-events-none sticky bottom-0 h-4 bg-gradient-to-t to-transparent" />
          </DialogContent>
        </Activity>
      </Dialog>
    </>
  );
}
