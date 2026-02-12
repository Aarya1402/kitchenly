import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";
import { v2 as cloudinary } from "cloudinary";
import { CATEGORIES } from "@/constants/categories";
import { MAX_FILE_SIZE } from "@/constants/max-file-size";
import { ALLOWED_TYPES } from "@/constants/allowed_file_types";
import { geminiModel } from "@/lib/gemini";

const EXTRACTOR_BASE_URL = process.env.EXTRACTOR_BASE_URL;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

async function uploadExtractorImageToCloudinary(
  extractedImagePath: string
): Promise<string | null> {
  // "extracted_images/foo.png" or "extracted_images\foo.png" → "foo.png"
  const filename = extractedImagePath.replace(/^extracted_images[/\\]/, "");
  if (!filename) return null;

  const imageUrl = `${EXTRACTOR_BASE_URL.replace(/\/$/, "")}/images/${filename}`;

  const res = await axios.get(imageUrl, { responseType: "arraybuffer" });
  const buffer = Buffer.from(res.data);

  const uploadResult: { secure_url: string } = await new Promise(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "recipes" }, (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result as { secure_url: string });
          else reject(new Error("Upload failed"));
        })
        .end(buffer);
    }
  );

  return uploadResult.secure_url;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Strict validations
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PNG, JPG, JPEG, or PDF allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be ≤ 10MB" },
        { status: 400 }
      );
    }

    /**
     * 1️⃣ Send file to local extractor API
     */
    const extractorForm = new FormData();
    extractorForm.append(
      "file",
      Buffer.from(await file.arrayBuffer()),
      file.name
    );

    const extractRes = await axios.post(
      "https://kitchenly-1.onrender.com/extract",
      extractorForm,
      {
        headers: extractorForm.getHeaders(),
      }
    );

    if (!extractRes.data?.success) {
      throw new Error("Extraction failed");
    }

    const extractedRecipe = extractRes.data.recipe;
    const firstImage =
      extractRes.data.images?.length > 0 ? extractRes.data.images[0] : null;

    /**
     * 2️⃣ Enrich recipe using Gemini
     * (Gemini already configured in your project)
     */

    const geminiPrompt = `
You are a professional recipe analyzer and data normalizer.

Given this extracted recipe data:
${JSON.stringify(extractedRecipe, null, 2)}

Your task is to infer and return ONLY valid JSON with the following fields:

1. servings: number  
   - Infer if missing
   - Default to 2 if unclear

2. cuisine: string or null  
   - Example: "Indian", "Italian", "Mexican"

3. dietaryTags: array of strings  
   - Examples: ["vegetarian", "vegan", "gluten-free", "eggless"]

4. ingredients: array of objects, EACH containing:
   - name: string (ingredient name only, no quantity)
   - quantity: string (e.g. "200g", "1 tsp", "2 cups")
   - category: string (MUST be one of the allowed categories)

Allowed categories (choose EXACTLY one per ingredient):
${CATEGORIES.map((c) => `- ${c}`).join("\n")}

Rules (STRICT):
- Every ingredient MUST have a category
- Category MUST match one of the allowed values exactly
- If unsure, use "Other"
- Do NOT invent new categories
- Do NOT return explanations, markdown, or extra text
- Output ONLY valid JSON
`;

    const geminiResponse = await geminiModel.generateContent(geminiPrompt);
    // console.log(geminiResponse.response.text();
    const rawText = geminiResponse.response.text();

    // Gemini sometimes wraps JSON in text — extract it safely
    const jsonStart = rawText.indexOf("{");
    const jsonEnd = rawText.lastIndexOf("}");
    const metadata = JSON.parse(rawText.slice(jsonStart, jsonEnd + 1));

    /**
     * 3️⃣ Upload extracted image to Cloudinary (if any)
     * Extractor returns paths like "extracted_images/xyz.png" - we fetch from
     * extractor's /images endpoint and upload to Cloudinary so the recipe gets
     * a persistent Cloudinary URL.
     */
    let imageUrl: string | null = null;
    if (firstImage) {
      try {
        imageUrl = (await uploadExtractorImageToCloudinary(firstImage)) ?? null;
      } catch (err) {
        console.error("Failed to upload extracted image to Cloudinary:", err);
        // Proceed without image - recipe can still be saved
      }
    }

    /**
     * 4️⃣ Normalize to Recipe Prisma model shape
     */
    const recipe = {
      title: extractedRecipe.title,
      description: extractedRecipe.description ?? null,
      imageUrl,

      servings: metadata.servings ?? 2,
      cuisine: metadata.cuisine ?? null,
      dietaryTags: metadata.dietaryTags ?? [],

      ingredients: extractedRecipe.ingredients.map((item: string) => ({
        name: item,
        quantity: "",
        category: null,
      })),

      steps: extractedRecipe.steps.map((step: string, index: number) => ({
        stepNo: index + 1,
        content: step,
      })),
    };

    return NextResponse.json({ recipe });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
