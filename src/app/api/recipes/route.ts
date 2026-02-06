import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";
import { normalizeIngredient } from "@/lib/ingredient-normalizer";
import axios from "axios";
export async function GET(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const page = Math.max(Number(searchParams.get("page")) || 1, 1);
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit")) || 10, 1),
    50,
  );

  const skip = (page - 1) * limit;

  const [total, recipes] = await Promise.all([
    prisma.recipe.count({
      where: { userId },
    }),

    prisma.recipe.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        ingredients: {
          select: { name: true, quantity: true },
        },
        steps: {
          select: { stepNo: true, content: true },
          orderBy: { stepNo: "asc" },
        },
      },
    }),
  ]);
  return NextResponse.json({
    data: recipes,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + recipes.length < total,
  });
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

function isCloudinaryUrl(url: string) {
  return url.includes("res.cloudinary.com");
}
async function uploadExtractedImageToCloudinary(
  extractedImagePath: string,
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
  const uploadResult: any = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "recipes" }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(buffer);
  });

  return uploadResult.secure_url;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  /* ───────── Handle imageUrl ───────── */

  let finalImageUrl: string | null = body.imageUrl ?? null;

  try {
    if (finalImageUrl && finalImageUrl.startsWith("/extracted_images")) {
      finalImageUrl = await uploadExtractedImageToCloudinary(finalImageUrl);
    }
  } catch (err) {
    console.error("Cloudinary upload failed", err);
    return NextResponse.json(
      { error: "Failed to upload recipe image" },
      { status: 500 },
    );
  }

  if (finalImageUrl && !isCloudinaryUrl(finalImageUrl)) {
    try {
      const uploadResult = await cloudinary.uploader.upload(finalImageUrl, {
        folder: "recipes",
      });

      finalImageUrl = uploadResult.secure_url;
    } catch (err) {
      console.error("Cloudinary upload failed", err);
      return NextResponse.json(
        { error: "Failed to upload recipe image" },
        { status: 500 },
      );
    }
  }

  /* ───────── Save recipe ───────── */

  const recipe = await prisma.recipe.create({
    data: {
      userId,
      title: body.title,
      description: body.description,
      servings: body.servings,
      dietaryTags: body.dietaryTags,
      imageUrl: finalImageUrl,
      cuisine: body.cuisine,
      ingredients: {
        create: body.ingredients.map(normalizeIngredient),
      },

      steps: {
        create: body.steps.map((content: string, i: number) => ({
          stepNo: i + 1,
          content,
        })),
      },
    },
  });

  return NextResponse.json({ success: true, recipe });
}
