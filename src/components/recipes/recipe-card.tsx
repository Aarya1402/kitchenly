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
    userId?: string;
    createdByName?: string | null;
  };
  currentUserId?: string | null;
  onClick: () => void;
};

export function RecipeCard({
  recipe,
  currentUserId,
  onClick,
}: RecipeCardProps) {
  const addedByLabel =
    recipe.userId && recipe.userId === currentUserId
      ? "Added by me"
      : recipe.createdByName
        ? `Added by ${recipe.createdByName}`
        : recipe.userId
          ? "Added by Unknown"
          : null;

  return (
    <Card
      className="flex h-[360px] flex-col overflow-hidden"
      onClick={onClick}
      data-tour="recipe-card"
    >
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

        {/* Added by - bottom left border area */}
        {addedByLabel && (
          <div className="mt-2 border-l-2 border-muted-foreground/30 pl-2 text-left text-xs text-muted-foreground">
            {addedByLabel}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
