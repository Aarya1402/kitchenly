export type Recipe = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  servings: number;
  dietaryTags: string[];
  ingredients: { name: string; quantity: string }[];
  steps: { stepNo: number; content: string }[];
};
