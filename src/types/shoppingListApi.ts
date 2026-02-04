export type RecipeInListCreateInput = {
  recipeId: string;
  title: string;
  baseServings?: number;
  servingsUsed: number;
};

export type ManualItemCreateInput = {
  ingredientKey: string;
  quantity: number;
  unit: string;
  category?: string;
};

export type ManualItemSaveInput = {
  ingredientKey: string;
  quantity: number;
  unit: string;
  category: string;
};
