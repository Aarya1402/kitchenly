import { UNIT_ALIASES } from "@/constants/unit-aliases";
import {DESCRIPTORS} from "@/constants/ingredient-descriptors";
import { FRACTIONS } from "@/constants/factions";

function normalizeQuantity(input: string): string {
  let q = input.toLowerCase().trim();

  // Replace unicode fractions
  for (const [symbol, value] of Object.entries(FRACTIONS)) {
    q = q.replace(symbol, value.toString());
  }

  // Normalize units
  for (const [alias, canonical] of Object.entries(UNIT_ALIASES)) {
    const regex = new RegExp(`\\b${alias}\\b`, "g");
    q = q.replace(regex, canonical);
  }

  return q;
}

function singularize(word: string): string {
  if (word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.endsWith("s") && !word.endsWith("ss"))
    return word.slice(0, -1);
  return word;
}

function normalizeName(input: string): string {
  let name = input.toLowerCase();

  DESCRIPTORS.forEach((d) => {
    const regex = new RegExp(`\\b${d}\\b`, "g");
    name = name.replace(regex, "");
  });

  name = name.replace(/\s+/g, " ").trim();

  // Singularize each word
  name = name
    .split(" ")
    .map(singularize)
    .join(" ");

  return name;
}

/* ───────────────────── PUBLIC API ───────────────────── */

export function normalizeIngredient(ingredient: {
  quantity: string;
  name: string;
}) {
    const normalized = {
    quantity: normalizeQuantity(ingredient.quantity),
    name: normalizeName(ingredient.name),
  };

  console.log("INGREDIENT NORMALIZATION");
  console.log("Before:", ingredient);
  console.log("After :", normalized);

  return normalized;
}
