"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { createRecipe, updateRecipe } from "@/app/recipes/actions";
import { RecipeProgress } from "@/components/recipes/recipe-progress";
import type { ParsedStep } from "@/lib/recipe-parser";
import { uploadImage } from "@/lib/upload";
import { Ingredient } from "@/types/ingredient";
import type { Recipe, RecipeStep } from "@/types/recipe";

import { IngredientsCard } from "./steps/ingredients-card";
import { RecipeBasicsCard } from "./steps/recipe-basics-card";
import { RecipePreview } from "./steps/recipe-preview";
import { StepSource } from "./steps/step-source-select";
import { StepsCard } from "./steps/steps-card";
import { StepFooter } from "./steps/steps-footer";

type Props = {
  mode: "create" | "edit";
  initialData?: Recipe | null;
  recipeId?: string;
};

export function RecipeEditor({ mode, initialData, recipeId }: Props) {
  /* ───────── Routing ───────── */
  const router = useRouter();

  const [step, setStep] = useState(mode === "edit" ? 2 : 1);
  const [saving, setSaving] = useState(false);

  /* ───────── State ───────── */

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [servings, setServings] = useState(2);
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [stepsData, setStepsData] = useState<string[]>([]);

  /* ───────── Prefill (EDIT MODE) ───────── */

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description ?? "");
      setServings(initialData.servings);
      setDietaryTags(initialData.dietaryTags ?? []);
      setImageUrl(initialData.imageUrl ?? null);
      setCuisine(initialData.cuisine ?? null);
      setIngredients(
        initialData.ingredients.map((i) => ({
          name: i.name,
          quantity: i.quantity,
        }))
      );

      setStepsData(
        initialData.steps
          .sort((a: RecipeStep, b: RecipeStep) => a.stepNo - b.stepNo)
          .map((s) => s.content)
      );
    }
  }, [mode, initialData]);

  /* ───────── Save ───────── */

  const handleSave = async () => {
    setSaving(true);
    let finalImageUrl: string | null = imageUrl;

    try {
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      const payload = {
        title,
        description,
        servings,
        dietaryTags,
        ingredients,
        steps: stepsData,
        imageUrl: finalImageUrl,
        cuisine,
      };

      if (mode === "create") {
        await createRecipe(payload);
        toast.success("Recipe created!");
      } else {
        if (!recipeId) throw new Error("No recipe ID");
        await updateRecipe(recipeId, payload);
        toast.success("Recipe updated!");
      }

      router.push("/recipes");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save recipe");
    } finally {
      setSaving(false);
    }
  };

  /* ───────── UI ───────── */

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <RecipeProgress total={5} step={step} />
      {/* STEP 1 – Source (create only) */}
      {step === 1 && mode === "create" && (
        <StepSource
          onManual={() => setStep(2)}
          onFetched={(data) => {
            setTitle(data.title ?? "");
            setDescription(data.description ?? "");
            setServings(data.servings ?? 2);
            setDietaryTags(data.dietaryTags ?? []);
            setCuisine(data.cuisine ?? null);
            setImageUrl(data.imageUrl ?? null);
            setIngredients(data.ingredients ?? []);
            setStepsData(data.steps?.map((s: ParsedStep) => s.content) ?? []);
            setStep(2);
          }}
        />
      )}

      {/* STEP 2 – Basics */}
      {step === 2 && (
        <>
          <RecipeBasicsCard
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            servings={servings}
            setServings={setServings}
            dietaryTags={dietaryTags}
            setDietaryTags={setDietaryTags}
            setImageFile={setImageFile}
            setCuisine={setCuisine}
            cuisine={cuisine}
            mode={mode}
          />
          <StepFooter
            onBack={mode === "create" ? () => setStep(1) : undefined}
            onNext={() => setStep(3)}
          />
        </>
      )}

      {/* STEP 3 – Ingredients */}
      {step === 3 && (
        <>
          <IngredientsCard
            ingredients={ingredients}
            setIngredients={setIngredients}
          />
          <StepFooter onBack={() => setStep(2)} onNext={() => setStep(4)} />
        </>
      )}

      {/* STEP 4 – Steps */}
      {step === 4 && (
        <>
          <StepsCard steps={stepsData} setSteps={setStepsData} />
          <StepFooter onBack={() => setStep(3)} onNext={() => setStep(5)} />
        </>
      )}

      {/* STEP 5 – Preview */}
      {step === 5 && (
        <>
          <RecipePreview
            title={title}
            description={description}
            servings={servings}
            dietaryTags={dietaryTags}
            ingredients={ingredients}
            steps={stepsData}
            imageUrl={imageUrl}
          />
          <StepFooter
            onBack={() => setStep(4)}
            onNext={handleSave}
            nextLabel={mode === "edit" ? "Update Recipe" : "Save Recipe"}
            loading={saving}
          />
        </>
      )}
    </div>
  );
}
