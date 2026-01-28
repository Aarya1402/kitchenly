import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const list = await prisma.shoppingList.findFirst({
    where: {
      shareToken: token,
      isShared: true,
    },
    include: {
      manualItems: true,
      itemStates: true,
    },
  });

  if (!list) {
    return NextResponse.json({ error: "Link expired" }, { status: 404 });
  }
    console.log(list);

  return NextResponse.json({
    title: list.title,
    items: list.manualItems.map((i) => ({
      name: i.ingredientKey,
      quantity: `${i.quantity} ${i.unit}`.trim(),
      category: i.category,
    })),
  });
}
