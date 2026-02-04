import { ItemState } from "./itemState";

export type RecipeIngredientForAggregate = {
  name: string;
  quantity: string;
  unit?: string;
  category?: string;
};

export type RecipeForAggregate = {
  baseServings?: number | null;
  servingsUsed: number;
  recipe?: {
    ingredients: RecipeIngredientForAggregate[];
  } | null;
};

export type ManualItemForAggregate = {
  ingredientKey: string;
  quantity: number;
  unit: string;
  category: string | null;
};

export type ListForAggregate = {
  recipes: RecipeForAggregate[];
  manualItems?: ManualItemForAggregate[];
  itemStates?: ItemState[];
};
