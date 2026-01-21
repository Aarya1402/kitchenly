import { NextRequest, NextResponse } from "next/server";
import { parseRecipeFromUrl } from "@/services/recipe-parser";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const recipe = await parseRecipeFromUrl(url);

    return NextResponse.json({ success: true, recipe });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to parse recipe" },
      { status: 500 },
    );
  }
}
