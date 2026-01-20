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
  <Card className="overflow-hidden" onClick={onClick}>
  {/* Image */}
 <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-muted">
  <Image
    src={recipe.imageUrl ?? "/images/recipe-placeholder.png"}
    alt={recipe.title}
    fill
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
    className="object-cover"
  />
</div>


  {/* Content */}
  <CardContent className="space-y-2 pt-4">
    <h3 className="font-semibold">{recipe.title}</h3>
    <p className="text-sm text-muted-foreground">
      Servings: {recipe.servings}
    </p>

    <div className="flex flex-wrap gap-1">
      {recipe.dietaryTags.map((tag) => (
        <Badge key={tag} variant="secondary">
          {tag}
        </Badge>
      ))}
    </div>
  </CardContent>
</Card>

  );
}
