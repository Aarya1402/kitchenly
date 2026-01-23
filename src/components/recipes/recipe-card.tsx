import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
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
    <Card className="flex h-[360px] flex-col overflow-hidden" onClick={onClick}>
      {/* Image */}
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-muted">
        <Image
          src={recipe.imageUrl ?? "/images/recipe-placeholder.png"}
          alt={recipe.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Content */}
      <CardContent className="flex flex-1 flex-col gap-2 pt-4">
        <h3 className="line-clamp-2 text-sm font-semibold">{recipe.title}</h3>

        <p className="text-xs text-muted-foreground">
          Servings: {recipe.servings}
        </p>

        <div className="mt-auto flex flex-wrap gap-1">
          {recipe.dietaryTags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
