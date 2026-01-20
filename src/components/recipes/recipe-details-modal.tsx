"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Recipe } from "@/types/recipe";
import { toast } from "sonner";

type Props = {
  recipe: Recipe | null;
  open: boolean;
  onClose: () => void;
  onDeleted: (recipe: Recipe) => void;
};

export function RecipeDetailsModal({
  recipe,
  open,
  onClose,
  onDeleted,
}: Props) {
  const router = useRouter();

  if (!recipe) return null;


const handleDelete = () => {
  if (!recipe) return;
onDeleted(recipe);
  // toast("Delete recipe?", {
  //   description: `"${recipe.title}" will be permanently removed.`,
  //   action: {
  //     label: "Delete",
  //     onClick: () => {
  //       onDeleted(recipe);
  //     },
  //   },
  //   cancel: {
  //     label: "Cancel",
  //     onClick: () => {
  //       // nothing
  //     },
  //   },
  // });
};


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{recipe.title}</DialogTitle>
        </DialogHeader>

        {recipe.imageUrl && (
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Badge>Servings: {recipe.servings}</Badge>
          {recipe.dietaryTags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>

        <div>
          <h3 className="font-medium">Ingredients</h3>
          <ul className="list-disc pl-5 text-sm">
            {recipe.ingredients.map((i, idx) => (
              <li key={idx}>
                {i.quantity} {i.name}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-medium">Steps</h3>
          <ol className="list-decimal pl-5 text-sm">
            {recipe.steps.map((s) => (
              <li key={s.stepNo}>{s.content}</li>
            ))}
          </ol>
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.push(`/recipes/${recipe.id}/edit`)}
          >
            Edit
          </Button>

          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
