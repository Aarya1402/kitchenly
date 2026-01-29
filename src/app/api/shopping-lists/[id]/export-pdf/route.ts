import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import puppeteer from "puppeteer";
function canonicalizeName(name: string) {
  return name.trim().toLowerCase();
}

function parseQuantity(input: string) {
  const match = input.trim().match(/^([\d.]+)\s*(.*)$/);
  if (!match) return { value: 1, unit: "piece" };
  return {
    value: Number(match[1]),
    unit: match[2] || "piece",
  };
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;


  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const list = await prisma.shoppingList.findUnique({
    where: { id },
    include: {
      recipes: {
        include: {
          recipe: {
            include: { ingredients: true },
          },
        },
      },
      manualItems: true,
      itemStates: true,
    },
  });

  if (!list || list.userId !== userId) {
    return new NextResponse("Not found", { status: 404 });
  }

  /* ───────── Build checked map ───────── */

  const isCheckedMap = new Map(
    list.itemStates.map((s) => [s.ingredientKey, s.isChecked]),
  );

  /* ───────── Aggregate ingredients (SAME AS GET API) ───────── */

  const aggregated = new Map<
    string,
    {
      name: string;
      quantity: number;
      unit: string;
      category: string;
      isChecked: boolean;
    }
  >();

  // from recipes
  for (const r of list.recipes) {
    const scale = r.servingsUsed / r.baseServings;

    for (const ing of r.recipe.ingredients) {
      const parsed = parseQuantity(ing.quantity);
      if (!parsed) continue;

      const key = canonicalizeName(ing.name);
      const existing = aggregated.get(key);

      if (existing) {
        existing.quantity += parsed.value * scale;
      } else {
        aggregated.set(key, {
          name: ing.name,
          quantity: parsed.value * scale,
          unit: parsed.unit,
          category: ing.category || "Other",
          isChecked: isCheckedMap.get(key) ?? false,
        });
      }
    }
  }

  // from manual items
  for (const m of list.manualItems) {
    const existing = aggregated.get(m.ingredientKey);

    if (existing) {
      existing.quantity += m.quantity;
    } else {
      aggregated.set(m.ingredientKey, {
        name: m.ingredientKey,
        quantity: m.quantity,
        unit: m.unit,
        category: m.category,
        isChecked: isCheckedMap.get(m.ingredientKey) ?? false,
      });
    }
  }

  /* ───────── Group by category ───────── */

  const groups: Record<
    string,
    typeof aggregated extends Map<any, infer V> ? V[] : never
  > = {};

  for (const item of aggregated.values()) {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  }

  /* ───────── Build HTML ───────── */

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${list.title}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 32px; }
    h1 { margin-bottom: 16px; }
    h2 { margin-top: 24px; border-bottom: 1px solid #ddd; }
    ul { list-style: none; padding: 0; }
    li { margin: 6px 0; font-size: 13px; }
  </style>
</head>
<body>
  <h1>${list.title}</h1>

  ${Object.entries(groups)
    .map(
      ([category, items]) => `
        <h2>${category}</h2>
        <ul>
          ${items
            .map(
              (i) =>
                `<li>${i.isChecked ? "☑" : "☐"} ${i.quantity.toFixed(2)} ${i.unit} ${i.name}</li>`,
            )
            .join("")}
        </ul>
      `,
    )
    .join("")}
</body>
</html>
`;

  /* ───────── Generate PDF ───────── */

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdf = await page.pdf({ format: "A4", printBackground: true });
  await browser.close();

  return new NextResponse(new Blob([pdf], { type: "application/pdf" }), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${list.title}.pdf"`,
    },
  });
}

