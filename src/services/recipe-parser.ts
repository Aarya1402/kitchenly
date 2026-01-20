import axios from "axios";
import * as cheerio from "cheerio";
import { geminiModel } from "@/lib/gemini";
import { DIETARY_PREFERENCES } from "@/constants/dietary-preferences";

/* =======================
   Types (Prisma-aligned)
======================= */

export type ParsedIngredient = {
  name: string;
  quantity: string;
};

export type ParsedStep = {
  stepNo: number;
  content: string;
};

export type ParsedRecipe = {
  title: string;
  description?: string;
  imageUrl?: string;
  servings: number;
  dietaryTags: string[];
  ingredients: ParsedIngredient[];
  steps: ParsedStep[];
};

/* =======================
   Fetch HTML
======================= */

async function fetchHtml(url: string): Promise<string> {
  const res = await axios.get(url, {
    headers: {
      "User-Agent": "RecipeManagerBot/1.0",
    },
    timeout: 10000,
  });

  return res.data;
}

/* =======================
   Layer 1 – JSON-LD
======================= */

function tryJsonLd(html: string) {
  const $ = cheerio.load(html);

  for (const el of $('script[type="application/ld+json"]').toArray()) {
    try {
      const json = JSON.parse($(el).html() || "{}");

      const recipe =
        json["@type"] === "Recipe"
          ? json
          : Array.isArray(json["@graph"])
          ? json["@graph"].find((x) => x["@type"] === "Recipe")
          : null;

      if (!recipe) continue;

      return {
        title: recipe.name,
        description: recipe.description,
        imageUrl: Array.isArray(recipe.image)
          ? recipe.image[0]
          : recipe.image,
        servings: parseInt(recipe.recipeYield) || undefined,
        ingredients: recipe.recipeIngredient,
        steps: Array.isArray(recipe.recipeInstructions)
          ? recipe.recipeInstructions.map((s: any) =>
              typeof s === "string" ? s : s.text
            )
          : [],
      };
    } catch {
      continue;
    }
  }

  return null;
}

/* =======================
   Layer 2 & 3 – Fallback
======================= */

function extractRawText(html: string) {
  const $ = cheerio.load(html);

  return {
    title:
      $("h1").first().text().trim() ||
      $('meta[property="og:title"]').attr("content") ||
      undefined,

    text: $("body").text().replace(/\s+/g, " ").trim(),
  };
}

/* =======================
   Layer 4 – Gemini
======================= */

async function parseWithGemini(raw: any): Promise<ParsedRecipe> {
  const prompt = `
You are a recipe extraction engine.

Return ONLY valid JSON matching this schema:

{
  "title": string,
  "description": string | null,
  "imageUrl": string | null,
  "servings": number,
  "dietaryTags": string[],
  "ingredients": [
    { "name": string, "quantity": string }
  ],
  "steps": [
    { "stepNo": number, "content": string }
  ]
}

Rules:
- servings default = 2 if missing
- ingredients.quantity must be normalized (e.g. "one cup" → "1 cup")
- ingredients.name must be canonical (e.g. "olive oil", not "extra virgin olive oils")
- steps.stepNo must start from 1
- dietaryTags must be chosen ONLY from this list:
${DIETARY_PREFERENCES.join(", ")}

Raw input:
${JSON.stringify(raw, null, 2)}
`;

  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text();

  return JSON.parse(text);
}

/* =======================
   Orchestrator (PUBLIC)
======================= */

export async function parseRecipeFromUrl(
  url: string
): Promise<ParsedRecipe> {
  const html = await fetchHtml(url);

  const jsonLd = tryJsonLd(html);

  const raw =
    jsonLd ??
    (() => {
      const fallback = extractRawText(html);
      return fallback;
    })();

  return await parseWithGemini(raw);
}
