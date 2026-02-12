"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { RecipeEditor } from "@/components/recipes/recipe-editor";
import { MyRecipesFormSkeleton } from "@/components/ui/page-skeletons";
import type { Recipe } from "@/types/recipe";

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function loadRecipe() {
      try {
        const res = await axios.get(`/api/recipes/${id}`);
        setRecipe(res.data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadRecipe();
  }, [id]);

  if (loading) {
    return <MyRecipesFormSkeleton />;
  }

  if (error || !recipe) {
    return <div className="p-6">Recipe not found</div>;
  }

  return <RecipeEditor mode="edit" recipeId={recipe.id} initialData={recipe} />;
}
