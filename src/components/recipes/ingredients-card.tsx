"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

type Props = {
  ingredients: string[];
  setIngredients: (v: string[]) => void;
};

export function IngredientsCard({ ingredients, setIngredients }: Props) {
  const update = (i: number, value: string) => {
    const next = [...ingredients];
    next[i] = value;
    setIngredients(next);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingredients</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {ingredients.map((ing, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={ing}
              onChange={(e) => update(i, e.target.value)}
              placeholder="e.g. 200g paneer"
            />
            {ingredients.length > 1 && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() =>
                  setIngredients(ingredients.filter((_, x) => x !== i))
                }
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIngredients([...ingredients, ""])}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add ingredient
        </Button>
      </CardContent>
    </Card>
  );
}
