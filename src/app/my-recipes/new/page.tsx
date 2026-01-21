"use client";

import { useState } from "react";

import { StepSource } from "@/components/recipes/steps/step-source-select";
import { RecipeBasicsCard } from "@/components/recipes/steps/recipe-basics-card";
import { IngredientsCard } from "@/components/recipes/steps/ingredients-card";
import { StepsCard } from "@/components/recipes/steps/steps-card";
import { RecipePreview } from "@/components/recipes/steps/recipe-preview";
import { Button } from "@/components/ui/button";
import { Ingredient } from "@/types/ingredient";
import { StepFooter } from "@/components/recipes/steps/steps-footer";


export default function NewRecipePage() {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  /* ───────────── State ───────────── */

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [servings, setServings] = useState(2);
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", quantity: "" },
  ]);

  const [stepsData, setStepsData] = useState<string[]>([""]);

  /* ───────────── URL → state ───────────── */

  const handleFetchedRecipe = (recipe: any) => {
    setTitle(recipe.title ?? "");
    setDescription(recipe.description ?? "");
    setServings(recipe.servings ?? 2);
    setDietaryTags(recipe.dietaryTags ?? []);
    setImageUrl(recipe.imageUrl ?? null);

    setIngredients(
      recipe.ingredients?.length
        ? recipe.ingredients
        : [{ name: "", quantity: "" }]
    );

    setStepsData(
      recipe.steps?.length
        ? recipe.steps.map((s: any) => s.content)
        : [""]
    );

    setStep(2);
  };

  /* ───────────── Save Recipe ───────────── */

  const saveRecipe = async () => {
    setSaving(true);

    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          servings,
          dietaryTags,
          ingredients,
          steps: stepsData,
          imageUrl,
        }),
      });

      if (!res.ok) throw new Error();

      // redirect to recipes list
      window.location.href = "/my-recipes";
    } catch {
      alert("Failed to save recipe");
    } finally {
      setSaving(false);
    }
  };

  /* ───────────── UI ───────────── */

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* STEP 1 */}
      {step === 1 && (
        <StepSource
          onManual={() => setStep(2)}
          onFetched={handleFetchedRecipe}
        />
      )}

      {/* STEP 2 */}
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
          />

          <StepFooter
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        </>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <>
          <IngredientsCard
            ingredients={ingredients}
            setIngredients={setIngredients}
          />

          <StepFooter
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        </>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <>
          <StepsCard steps={stepsData} setSteps={setStepsData} />

          <StepFooter
            onBack={() => setStep(3)}
            onNext={() => setStep(5)}
          />
        </>
      )}

      {/* STEP 5 */}
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
            onNext={saveRecipe}
            nextLabel="Save Recipe"
            loading={saving}
          />
        </>
      )}
    </div>
  );
}
