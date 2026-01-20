"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RecipeProgress } from "@/components/recipes/recipe-progress";
import { RecipeBasicsCard } from "@/components/recipes/recipe-basics-card";
import { IngredientsCard } from "@/components/recipes/ingredients-card";
import { StepsCard } from "@/components/recipes/steps-card";
import { Ingredient } from "../../../types/ingredient";
import { RecipePreview } from "@/components/recipes/recipe-preview";

export default function NewRecipePage() {
  const [step, setStep] = useState(1);

  const [title, setTitle] = useState("");
  const [servings, setServings] = useState(2);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { quantity: "", name: "" },
  ]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [description, setDescription] = useState("");
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const imagePreviewUrl = imageFile ? URL.createObjectURL(imageFile) : imageUrl;

  const canNext =
    (step === 1 && title.trim().length > 0) ||
    (step === 2 &&
      ingredients.some((i) => i.quantity.trim() && i.name.trim())) ||
    (step === 3 && steps.some((s) => s.trim().length > 0));

  const canSave =
    title.trim().length > 0 &&
    ingredients.some((i) => i.quantity.trim() && i.name.trim()) &&
    steps.some((s) => s.trim().length > 0);

  const handleSave = async () => {
    let uploadedImageUrl = imageUrl;

    if (imageFile && !imageUrl) {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", imageFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        alert("Image upload failed");
        setUploading(false);
        return;
      }

      const uploadJson = await uploadRes.json();
      uploadedImageUrl = uploadJson.imageUrl;
      setImageUrl(uploadedImageUrl);
      setUploading(false);
    }

    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        servings,
        dietaryTags,
        imageUrl: uploadedImageUrl,
        ingredients: ingredients.filter(
          (i) => i.quantity.trim() && i.name.trim(),
        ),
        steps: steps.filter((s) => s.trim()),
      }),
    });

    if (!res.ok) {
      alert("Failed to save recipe");
      return;
    }

    window.location.href = "/my-recipes";
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-8">
      <RecipeProgress
        step={step}
        total={4}
        label={
          step === 1
            ? "Basics"
            : step === 2
              ? "Ingredients"
              : step === 3
                ? "Steps"
                : "Preview"
        }
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
      {step === 4 && (
        <RecipePreview
          title={title}
          description={description}
          servings={servings}
          dietaryTags={dietaryTags}
          ingredients={ingredients}
          steps={steps}
          imageUrl={imagePreviewUrl}
        />
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="ghost"
          disabled={step === 1}
          onClick={() => setStep(step - 1)}
        >
          Previous
        </Button>

        {step < 4 ? (
          <Button disabled={!canNext} onClick={() => setStep(step + 1)}>
            Next
          </Button>
        ) : (
          <Button disabled={!canSave || uploading} onClick={handleSave}>
            {uploading ? "Saving..." : "Save Recipe"}
          </Button>
        )}
      </div>
    </div>
  );
}
