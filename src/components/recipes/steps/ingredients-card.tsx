"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Ingredient } from "@/types/ingredient";

type Props = {
  ingredients: Ingredient[];
  setIngredients: (v: Ingredient[]) => void;
};

export function IngredientsCard({ ingredients, setIngredients }: Props) {
  const update = (index: number, field: keyof Ingredient, value: string) => {
    const next = [...ingredients];
    next[index] = { ...next[index], [field]: value };
    setIngredients(next);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { quantity: "", name: "" }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingredients</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              placeholder="Qty (e.g. 200g)"
              value={ingredient.quantity}
              onChange={(e) => update(index, "quantity", e.target.value)}
              className="w-32"
            />

            <Input
              placeholder="Ingredient name"
              value={ingredient.name}
              onChange={(e) => update(index, "name", e.target.value)}
              className="flex-1"
            />

            {ingredients.length > 1 && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeIngredient(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        <Button variant="outline" className="w-full" onClick={addIngredient}>
          <Plus className="mr-2 h-4 w-4" />
          Add ingredient
        </Button>
      </CardContent>
    </Card>
  );
}
