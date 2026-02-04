import { NextRequest, NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";
import type { Ingredient } from "@/types/ingredient";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, ingredients, steps } = body;

    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json(
        { error: "Ingredients are required" },
        { status: 400 },
      );
    }

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
${ingredients.map((i: Ingredient) => `- ${i.quantity} ${i.name}`).join("\n")}

Steps:
${steps.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")}
`;

    const result = await geminiModel.generateContent(prompt);
    const rawText = result.response.text();

    // Gemini sometimes wraps JSON in text — extract it safely
    const jsonStart = rawText.indexOf("{");
    const jsonEnd = rawText.lastIndexOf("}");

    const parsed = JSON.parse(rawText.slice(jsonStart, jsonEnd + 1));

    return NextResponse.json({
      success: true,
      tastePreview: parsed,
    });
  } catch (error) {
    console.error("Taste preview error:", error);
    return NextResponse.json(
      { error: "Failed to generate taste preview" },
      { status: 500 },
    );
  }
}
