import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type RecipeDetailsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe: {
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    servings: number;
    dietaryTags: string[];
    ingredients: { name: string; quantity: string }[];
    steps: { stepNo: number; content: string }[];
  } | null;
};

export function RecipeDetailsModal({
  open,
  onOpenChange,
  recipe,
}: RecipeDetailsModalProps) {
  if (!recipe) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{recipe.title}</DialogTitle>
        </DialogHeader>

        <img
          src={recipe.imageUrl ?? "/images/recipe-placeholder.jpg"}
          alt={recipe.title}
          className="mb-4 h-56 w-full rounded-lg object-cover"
        />

        {recipe.description && (
          <p className="mb-4 text-sm text-muted-foreground">
            {recipe.description}
          </p>
        )}

        <div className="mb-4 flex gap-2">
          <Badge variant="outline">Servings: {recipe.servings}</Badge>
          {recipe.dietaryTags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="mb-4">
          <h4 className="mb-2 font-medium">Ingredients</h4>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {recipe.ingredients.map((ing, i) => (
              <li key={i}>
                {ing.quantity} {ing.name}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-2 font-medium">Steps</h4>
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            {recipe.steps
              .sort((a, b) => a.stepNo - b.stepNo)
              .map((step) => (
                <li key={step.stepNo}>{step.content}</li>
              ))}
          </ol>
        </div>
      </DialogContent>
    </Dialog>
  );
}
