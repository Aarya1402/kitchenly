import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ingredient } from "@/types/ingredient";

type Props = {
  title: string;
  description: string;
  servings: number;
  dietaryTags: string[];
  ingredients: Ingredient[];
  steps: string[];
  imageUrl?: string | null;
};

export function RecipePreview({
  title,
  description,
  servings,
  dietaryTags,
  ingredients,
  steps,
  imageUrl,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Image */}
        {imageUrl && (
          <div className="bg-muted relative aspect-[16/9] w-full overflow-hidden rounded-lg">
            <Image src={imageUrl} alt={title} fill className="object-cover" />
          </div>
        )}

        {/* Title */}
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-2">
          <Badge>Servings: {servings}</Badge>
          {dietaryTags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Ingredients */}
        <div>
          <h3 className="font-medium">Ingredients</h3>
          <ul className="list-disc pl-5 text-sm">
            {ingredients.map((i, idx) => (
              <li key={idx}>
                {i.quantity} {i.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div>
          <h3 className="font-medium">Steps</h3>
          <ol className="list-decimal pl-5 text-sm">
            {steps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
