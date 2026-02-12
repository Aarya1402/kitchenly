"use client";

import { useState } from "react";

import { StepSource } from "@/components/recipes/steps/step-source-select";
import { RecipeBasicsCard } from "@/components/recipes/steps/recipe-basics-card";
import { IngredientsCard } from "@/components/recipes/steps/ingredients-card";
import { StepsCard } from "@/components/recipes/steps/steps-card";
import { RecipePreview } from "@/components/recipes/steps/recipe-preview";
import { Button } from "@/components/ui/button";
import { Ingredient } from "@/types/ingredient";
import type { ParsedRecipe, ParsedStep } from "@/lib/recipe-parser";
import { StepFooter } from "@/components/recipes/steps/steps-footer";
import { RecipeProgress } from "@/components/recipes/recipe-progress";
import axios from "axios";

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
  const [cuisine, setCuisine] = useState<string>("");

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", quantity: "" },
  ]);

  const [stepsData, setStepsData] = useState<string[]>([""]);

  /* ───────────── URL → state ───────────── */

  const handleFetchedRecipe = (recipe: ParsedRecipe) => {
    setTitle(recipe.title ?? "");
    setDescription(recipe.description ?? "");
    setServings(recipe.servings ?? 2);
    setDietaryTags(recipe.dietaryTags ?? []);
    setImageUrl(recipe.imageUrl ?? null);
    setCuisine(recipe.cuisine ?? "");
    setIngredients(
      recipe.ingredients?.length
        ? recipe.ingredients
        : [{ name: "", quantity: "" }]
    );

    setStepsData(
      recipe.steps?.length
        ? recipe.steps.map((s: ParsedStep) => s.content)
        : [""]
    );

    setStep(2);
  };

  /* ───────────── Save Recipe ───────────── */

  async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("/api/upload", formData);

      return res.data.imageUrl;
    } catch (error) {
      throw new Error("Image upload failed");
    }
  }

  const saveRecipe = async () => {
    setSaving(true);
    let finalImageUrl = imageUrl; // ← start with existing value

    if (imageFile) {
      finalImageUrl = await uploadImage(imageFile);
      setImageUrl(finalImageUrl); // keep UI in sync (optional)
    }
    try {
      const res = await axios.post(
        "/api/recipes",
        {
          title,
          description,
          servings,
          dietaryTags,
          ingredients,
          cuisine,
          steps: stepsData,
          imageUrl: finalImageUrl,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // redirect to recipes list
      window.location.href = "/recipes";
    } catch {
      alert("Failed to save recipe");
    } finally {
      setSaving(false);
    }
  };

  /* ───────────── UI ───────────── */

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <RecipeProgress total={5} step={step} />
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
            mode="create"
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            servings={servings}
            setServings={setServings}
            dietaryTags={dietaryTags}
            setDietaryTags={setDietaryTags}
            setImageFile={setImageFile}
            cuisine={cuisine}
            setCuisine={setCuisine}
          />

          <StepFooter onBack={() => setStep(1)} onNext={() => setStep(3)} />
        </>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <>
          <IngredientsCard
            ingredients={ingredients}
            setIngredients={setIngredients}
          />

          <StepFooter onBack={() => setStep(2)} onNext={() => setStep(4)} />
        </>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <>
          <StepsCard steps={stepsData} setSteps={setStepsData} />

          <StepFooter onBack={() => setStep(3)} onNext={() => setStep(5)} />
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
