import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const { title, items } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "No items to save" }, { status: 400 });
  }

  const list = await prisma.shoppingList.create({
    data: {
      userId,
      title: title || "Shopping List",
      items: {
        create: items.map((i: any) => ({
          name: i.name,
          quantity: i.quantity,
          category: i.category,
          checked: false,
        })),
      },
    },
  });

  return NextResponse.json({
    success: true,
    id: list.id,
  });
}

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lists = await prisma.shoppingList.findMany({
    where: { userId },
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    lists: lists.map((list) => ({
      id: list.id,
      title: list.title,
      createdAt: list.createdAt,
      total: list.items.length,
      completed: list.items.filter((i) => i.checked).length,
    })),
  });
}
