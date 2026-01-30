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
        imageUrl: Array.isArray(recipe.image) ? recipe.image[0] : recipe.image,
        servings: parseInt(recipe.recipeYield) || undefined,
        ingredients: recipe.recipeIngredient,
        steps: Array.isArray(recipe.recipeInstructions)
          ? normalizeInstructions(recipe.recipeInstructions)
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
  "cuisine": string | null,
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
- ingredients.name must be canonical
- generate title cased(the first letter of th e word is capitalized) cuisine based on the recipe name and description, or null if unknown
- steps.stepNo must start from 1
- dietaryTags must be chosen ONLY from this list:
${DIETARY_PREFERENCES.join(", ")}

Raw input:
${JSON.stringify(raw, null, 2)}
`;

  const result = await geminiModel.generateContent(prompt);
  const rawText = result.response.text();

  function extractJson(text: string) {
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No JSON object found in Gemini response");
    }

    return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
  }

  return extractJson(rawText);
}

function extractPhotoGuidedSteps(html: string) {
  const $ = cheerio.load(html);

  const steps: string[] = [];

  // Common patterns used by food blogs
  const stepImages = $("figure img, .wp-block-image img");

  stepImages.each((_, img) => {
    const texts: string[] = [];

    let el = $(img).parent().next();

    // Collect text until next image block
    while (el.length && !el.find("img").length && !el.is("figure")) {
      const text = el.text().trim();
      if (text.length > 20) {
        texts.push(text);
      }
      el = el.next();
    }

    if (texts.length > 0) {
      steps.push(texts.join(" "));
    }
  });

  return steps.length > 0 ? steps : null;
}

function normalizeInstructions(instructions: any[]): string[] {
  const steps: string[] = [];

  for (const step of instructions) {
    // 1️⃣ plain string
    if (typeof step === "string") {
      steps.push(step);
      continue;
    }

    // 2️⃣ text is string
    if (typeof step.text === "string") {
      steps.push(step.text);
      continue;
    }

    // 3️⃣ text is array
    if (Array.isArray(step.text)) {
      steps.push(step.text.join(" "));
      continue;
    }

    // 4️⃣ nested HowToDirection
    if (Array.isArray(step.itemListElement)) {
      const parts = step.itemListElement
        .map((x: any) => x.text)
        .filter(Boolean);

      if (parts.length > 0) {
        steps.push(parts.join(" "));
      }
    }
  }

  return steps;
}


/* =======================
   Orchestrator (PUBLIC)
======================= */

export async function parseRecipeFromUrl(url: string): Promise<ParsedRecipe> {
  const html = await fetchHtml(url);

  const jsonLd = tryJsonLd(html);

  const photoSteps = extractPhotoGuidedSteps(html);

  const raw =
    jsonLd ??
    (photoSteps
      ? {
          title: extractRawText(html).title,
          steps: photoSteps,
        }
      : extractRawText(html));

  return await parseWithGemini(raw);
}
