"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RecipeProgress } from "@/components/recipes/recipe-progress";
import { RecipeBasicsCard } from "@/components/recipes/recipe-basics-card";
import { IngredientsCard } from "@/components/recipes/ingredients-card";
import { StepsCard } from "@/components/recipes/steps-card";

export default function NewRecipePage() {
  const [step, setStep] = useState(1);

  const [title, setTitle] = useState("");
  const [servings, setServings] = useState(2);
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [description, setDescription] = useState("");
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const canNext =
    (step === 1 && title.trim().length > 0) ||
    (step === 2 && ingredients.some((i) => i.trim().length > 0));

  const canSave =
    title.trim().length > 0 &&
    ingredients.some((i) => i.trim().length > 0) &&
    steps.some((s) => s.trim().length > 0);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-8">
      <RecipeProgress
        step={step}
        total={3}
        label={step === 1 ? "Basics" : step === 2 ? "Ingredients" : "Steps"}
      />

      {step === 1 && (
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
      )}

      {step === 2 && (
        <IngredientsCard
          ingredients={ingredients}
          setIngredients={setIngredients}
        />
      )}

      {step === 3 && <StepsCard steps={steps} setSteps={setSteps} />}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="ghost"
          disabled={step === 1}
          onClick={() => setStep(step - 1)}
        >
          Previous
        </Button>

        {step < 3 ? (
          <Button disabled={!canNext} onClick={() => setStep(step + 1)}>
            Next
          </Button>
        ) : (
          <Button disabled={!canSave}>Save Recipe</Button>
        )}
      </div>
    </div>
  );
}
