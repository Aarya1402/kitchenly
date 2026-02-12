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
      className="group flex h-[380px] cursor-pointer flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
      onClick={onClick}
      data-tour="recipe-card"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-muted">
        <Image
          src={recipe.imageUrl ?? "/images/recipe-placeholder.png"}
          alt={recipe.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* Content */}
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-1">
          <h3 className="line-clamp-2 text-lg font-bold leading-tight tracking-tight group-hover:text-primary transition-colors">
            {recipe.title}
          </h3>
          <p className="text-sm text-muted-foreground font-medium">
            {recipe.servings} Servings
          </p>
        </div>

        <div className="mt-auto flex flex-wrap gap-1.5">
          {recipe.dietaryTags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-secondary/50 font-medium hover:bg-secondary">
              {tag}
            </Badge>
          ))}
          {recipe.dietaryTags.length > 3 && (
             <Badge variant="secondary" className="bg-secondary/50 font-medium">+{recipe.dietaryTags.length - 3}</Badge>
          )}
        </div>

        {/* Added by - bottom left border area */}
        {addedByLabel && (
          <div className="mt-3 border-l-2 border-primary/20 pl-2 text-left text-xs font-medium text-muted-foreground transition-colors group-hover:border-primary">
            {addedByLabel}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
