import { auth } from "@clerk/nextjs/server";
import { Buffer } from "buffer";
import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

import { prisma } from "@/lib/db";
import type { ExportPdfGroupItem } from "@/types/aggregatedItems";
/* ───────── helpers (unchanged) ───────── */

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

/* ───────── route ───────── */

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
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

  /* ───────── checked map ───────── */

  const isCheckedMap = new Map(
    list.itemStates.map((s) => [s.ingredientKey, s.isChecked])
  );

  /* ───────── aggregate ingredients ───────── */

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

  for (const r of list.recipes) {
    const scale = r.servingsUsed / r.baseServings;

    for (const ing of r.recipe.ingredients) {
      const parsed = parseQuantity(ing.quantity);
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

  /* ───────── group by category ───────── */

  const groups: Record<string, ExportPdfGroupItem[]> = {};
  for (const item of aggregated.values()) {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  }

  /* ───────── PDF generation (Netlify-safe) ───────── */

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y = 800;

  page.drawText(list.title, {
    x: 40,
    y,
    size: 18,
    font,
    color: rgb(0, 0, 0),
  });

  y -= 30;

  for (const [category, items] of Object.entries(groups)) {
    page.drawText(category, {
      x: 40,
      y,
      size: 14,
      font,
    });

    y -= 18;

    for (const i of items) {
      const line = `${i.isChecked ? "[x]" : "[ ]"} ${i.quantity.toFixed(2)} ${
        i.unit
      } ${i.name}`;

      page.drawText(line, {
        x: 50,
        y,
        size: 11,
        font,
      });

      y -= 14;

      if (y < 40) {
        y = 800;
        pdfDoc.addPage([595, 842]);
      }
    }

    y -= 12;
  }

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${list.title}.pdf"`,
    },
  });
}
