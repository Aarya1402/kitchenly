import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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
  size?: "default" | "large";
};

export function RecipeCard({
  recipe,
  currentUserId,
  onClick,
  size = "default",
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
      className={`group hover:shadow-primary/5 flex cursor-pointer flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${size === "large" ? "h-[460px]" : "h-[400px]"}`}
      onClick={onClick}
      data-tour="recipe-card"
    >
      {/* Image */}
      <div className="bg-muted relative aspect-[4/3] w-full shrink-0 overflow-hidden">
        <Image
          src={recipe.imageUrl ?? "/images/recipe-placeholder.png"}
          alt={recipe.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* Content - min-h-0 allows flex shrink; spacer pushes Added by to bottom */}
      <CardContent className="flex min-h-0 flex-1 flex-col p-5">
        <div className="min-w-0 flex-shrink-0 space-y-1">
          <h3 className="group-hover:text-primary line-clamp-2 text-lg leading-tight font-bold tracking-tight lowercase transition-colors first-letter:capitalize">
            {recipe.title}
          </h3>
          <p className="text-muted-foreground text-sm font-medium">
            {recipe.servings} Servings
          </p>
        </div>

        <div className="mt-2 flex flex-shrink-0 flex-wrap gap-1.5">
          {recipe.dietaryTags.slice(0, 1).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-secondary/50 hover:bg-secondary font-medium"
            >
              {tag}
            </Badge>
          ))}
          {recipe.dietaryTags.length > 1 && (
            <Badge variant="secondary" className="bg-secondary/50 font-medium">
              +{recipe.dietaryTags.length - 1}
            </Badge>
          )}
        </div>

        {/* Spacer - fills remaining space, allows "Added by" to stick to bottom */}
        <div className="min-h-0 flex-1" />

        {/* Added by - flex-shrink-0 ensures it's never cut off */}
        {addedByLabel && (
          <div className="border-primary/20 group-hover:border-primary mt-3 flex-shrink-0 border-l-2 pl-2 text-left text-xs font-medium transition-colors">
            {addedByLabel}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
