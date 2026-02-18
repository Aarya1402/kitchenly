"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";

import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/db";
import { normalizeIngredient } from "@/lib/ingredient-normalizer";

export async function getRecipes(params: {
  page?: number;
  limit?: number;
  query?: string;
  cuisines?: string[];
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { page = 1, limit = 10, query = "", cuisines = [] } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.RecipeWhereInput = {};

  if (query) {
    where.OR = [
      {
        title: {
          contains: query,
          mode: Prisma.QueryMode.insensitive,
        },
      },
      {
        description: {
          contains: query,
          mode: Prisma.QueryMode.insensitive,
        },
      },
    ];
  }

  if (cuisines && cuisines.length > 0) {
    where.cuisine = { in: cuisines };
  }

  // where.userId = userId; // Allow fetching all recipes

  const [recipes, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        ingredients: true,
        steps: { orderBy: { stepNo: "asc" } },
      },
    }),
    prisma.recipe.count({ where }),
  ]);

  return {
    data: recipes,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + recipes.length < total,
  };
}

export async function deleteRecipe(recipeId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
  });

  if (!recipe || recipe.userId !== userId) {
    throw new Error("Not found or unauthorized");
  }

  await prisma.recipe.delete({
    where: { id: recipeId },
  });

  revalidatePath("/recipes");
  return { success: true };
}

export async function getCuisines() {
  const cuisines = await prisma.recipe.findMany({
    select: { cuisine: true },
    where: { cuisine: { not: null } },
    distinct: ["cuisine"],
  });

  // Extract strings and filter nulls
  return cuisines
    .map((c) => c.cuisine)
    .filter((c): c is string => typeof c === "string" && c.length > 0);
}

/* ───────── Cloudinary Configuration ───────── */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

function isCloudinaryUrl(url: string) {
  return url.includes("res.cloudinary.com");
}

async function uploadExtractedImageToCloudinary(
  extractedImagePath: string
): Promise<string> {
  // "/extracted_images/foo.png" → "foo.png"
  const filename = extractedImagePath.replace(/^\/?extracted_images\//, "");

  const OCR_BASE_URL = process.env.OCR_BASE_URL || "http://192.168.24.68:8000";

  const imageUrl = `${OCR_BASE_URL}/images/${filename}`;

  // Download image as buffer
  const res = await axios.get(imageUrl, {
    responseType: "arraybuffer",
  });

  const buffer = Buffer.from(res.data);

  // Upload buffer to Cloudinary
  const uploadResult: { secure_url: string } = await new Promise(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "recipes" }, (error, result) => {
          if (error) reject(error);
          else resolve(result as { secure_url: string });
        })
        .end(buffer);
    }
  );

  return uploadResult.secure_url;
}

/* ───────── Types ───────── */

type RecipeUpsertInput = {
  title: string;
  description?: string | null;
  servings: number;
  dietaryTags: string[];
  imageUrl?: string | null;
  cuisine?: string | null;
  ingredients: { name: string; quantity: string }[];
  steps: string[];
};

/* ───────── Create / Update ───────── */

export async function createRecipe(data: RecipeUpsertInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  let finalImageUrl: string | null = data.imageUrl ?? null;

  try {
    if (finalImageUrl && finalImageUrl.startsWith("/extracted_images")) {
      finalImageUrl = await uploadExtractedImageToCloudinary(finalImageUrl);
    }
  } catch (err) {
    console.error("Cloudinary upload failed", err);
    throw new Error("Failed to upload recipe image");
  }

  if (finalImageUrl && !isCloudinaryUrl(finalImageUrl)) {
    try {
      const uploadResult = await cloudinary.uploader.upload(finalImageUrl, {
        folder: "recipes",
      });

      finalImageUrl = uploadResult.secure_url;
    } catch (err) {
      console.error("Cloudinary upload failed", err);
      throw new Error("Failed to upload recipe image");
    }
  }

  /* ───────── Get creator display name from Clerk ───────── */
  let createdByName: string | null = null;
  try {
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    createdByName = user.firstName
      ? [user.firstName, user.lastName].filter(Boolean).join(" ") || null
      : (user.username ?? null);
  } catch {
    // Fallback if Clerk lookup fails
  }

  const recipe = await prisma.recipe.create({
    data: {
      userId,
      createdByName,
      title: data.title,
      description: data.description,
      servings: data.servings,
      dietaryTags: data.dietaryTags,
      imageUrl: finalImageUrl,
      cuisine: data.cuisine,
      ingredients: {
        create: data.ingredients.map(normalizeIngredient),
      },
      steps: {
        create: data.steps.map((content: string, i: number) => ({
          stepNo: i + 1,
          content,
        })),
      },
    },
  });

  revalidatePath("/recipes");
  return { success: true, recipe };
}

export async function updateRecipe(id: string, data: RecipeUpsertInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const existing = await prisma.recipe.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw new Error("Not found or unauthorized");
  }

  let finalImageUrl: string | null = data.imageUrl ?? null;

  // If changed and not cloudinary, upload it
  if (
    finalImageUrl &&
    finalImageUrl !== existing.imageUrl &&
    !isCloudinaryUrl(finalImageUrl)
  ) {
    // Check if it's extracted
    try {
      if (finalImageUrl.startsWith("/extracted_images")) {
        finalImageUrl = await uploadExtractedImageToCloudinary(finalImageUrl);
      } else {
        const uploadResult = await cloudinary.uploader.upload(finalImageUrl, {
          folder: "recipes",
        });
        finalImageUrl = uploadResult.secure_url;
      }
    } catch {
      throw new Error("Failed to upload recipe image");
    }
  }

  await prisma.recipe.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      servings: data.servings,
      dietaryTags: data.dietaryTags,
      ...(finalImageUrl !== undefined && { imageUrl: finalImageUrl }),
      cuisine: data.cuisine,
      ingredients: {
        deleteMany: {},
        create: data.ingredients.map(normalizeIngredient),
      },
      steps: {
        deleteMany: {},
        create: data.steps.map((content: string, index: number) => ({
          stepNo: index + 1,
          content,
        })),
      },
    },
  });

  revalidatePath("/recipes");
  revalidatePath(`/recipes/${id}`);
  return { success: true };
}

export async function getRecipe(id: string) {
  const { userId } = await auth();
  if (!userId) return null;

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: true,
      steps: {
        orderBy: { stepNo: "asc" },
      },
    },
  });

  return recipe;
}

export async function getTastePreview(data: {
  title: string;
  ingredients: { name: string; quantity: string }[];
  steps: string[];
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { title, ingredients, steps } = data;

  if (!ingredients || ingredients.length === 0) {
    throw new Error("Ingredients are required");
  }

  const { geminiModel } = await import("@/lib/gemini");

  const prompt = `
You are a professional chef and food critic.
Analyze the following recipe and return ONLY valid JSON
(no markdown, no explanations, no formatting characters).

The JSON must follow this exact structure:
{
  "overallTaste": string,
  "spiceLevel": "Low" | "Medium" | "Medium-High" | "High",
  "richness": "Light" | "Balanced" | "Heavy",
  "dominantFlavors": string[],
  "bestFor": string
}

Recipe title: ${title}

Ingredients:
${ingredients.map((i) => `- ${i.quantity} ${i.name}`).join("\n")}

Steps:
${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}
`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const rawText = result.response.text();

    const jsonStart = rawText.indexOf("{");
    const jsonEnd = rawText.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("Invalid response from AI");
    }

    const parsed = JSON.parse(rawText.slice(jsonStart, jsonEnd + 1));
    return parsed;
  } catch (error) {
    console.error("Taste preview error:", error);
    throw new Error("Failed to generate taste preview");
  }
}
// ... existing code ...

export async function uploadImageAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const file = formData.get("file") as File;
  if (!file) {
    return { success: false, error: "No file provided" };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult: { secure_url: string } = await new Promise(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "recipes" }, (error, result) => {
            if (error) reject(error);
            else resolve(result as { secure_url: string });
          })
          .end(buffer);
      }
    );

    return { success: true, imageUrl: uploadResult.secure_url };
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, error: "Failed to upload image" };
  }
}

export async function translateRecipe(data: {
  title: string;
  description: string | null;
  ingredients: { name: string; quantity: string }[];
  steps: { content: string }[];
  cuisine: string | null;
  language: string;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { title, description, ingredients, steps, cuisine, language } = data;
  const { geminiModel } = await import("@/lib/gemini");

  const prompt = `
You are a professional translator and chef.
Translate the following recipe details into ${language}.
Return ONLY valid JSON (no markdown, no explanations).

JSON Structure:
{
  "title": string,
  "description": string | null,
  "ingredients": [
    { "name": string, "quantity": string }
  ],
  "steps": string[],
  "cuisine": string | null
}

Original Recipe:
Title: ${title}
Description: ${description || ""}
Cuisine: ${cuisine || ""}
Ingredients:
${ingredients.map((i) => `- ${i.quantity} ${i.name}`).join("\n")}
Steps:
${steps.map((s, i) => `${i + 1}. ${s.content}`).join("\n")}
`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const rawText = result.response.text();

    const jsonStart = rawText.indexOf("{");
    const jsonEnd = rawText.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("Invalid response from AI");
    }

    const parsed = JSON.parse(rawText.slice(jsonStart, jsonEnd + 1));
    return parsed;
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error("Failed to translate recipe");
  }
}
