import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type RecipeCardProps = {
  recipe: {
    id: string;
    title: string;
    imageUrl?: string | null;
    servings: number;
    dietaryTags: string[];
  };
  onClick: () => void;
};

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer overflow-hidden transition hover:shadow-lg"
    >
      <img
        src={recipe.imageUrl ?? "/images/recipe-placeholder.jpg"}
        alt={recipe.title}
        className="h-40 w-full object-cover"
      />

      <CardContent className="space-y-2 p-4">
        <h3 className="line-clamp-1 text-sm font-semibold">
          {recipe.title}
        </h3>

        <p className="text-xs text-muted-foreground">
          Servings: {recipe.servings}
        </p>

        <div className="flex flex-wrap gap-1">
          {recipe.dietaryTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
