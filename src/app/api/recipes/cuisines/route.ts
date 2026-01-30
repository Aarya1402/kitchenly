import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cuisines = await prisma.recipe.findMany({
      where: {
        userId,
        cuisine: {
          not: null,
        },
      },
      distinct: ["cuisine"],
      select: {
        cuisine: true,
      },
      orderBy: {
        cuisine: "asc",
      },
    });

    return NextResponse.json({
      cuisines: cuisines.map((c) => c.cuisine).filter(Boolean),
    });
  } catch (error) {
    console.error("Failed to fetch cuisines", error);
    return NextResponse.json(
      { error: "Failed to fetch cuisines" },
      { status: 500 },
    );
  }
}
