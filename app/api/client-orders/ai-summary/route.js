import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

// Инициализация на Google доставчика
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
});

function fmt(n) {
  return Number(n ?? 0).toFixed(2) + " лв";
}

function productName(p) {
  if (!p) return "Непознат";
  const parts = [
    p.name,
    p.weight,
    p.flavor,
    p.puffs ? `${p.puffs} puffs` : null,
    p.count ? `x${p.count}` : null
  ];
  return parts.filter(Boolean).join(" ");
}

function buildPrompt({ summary, period, isSuperAdmin }) {
  const lines = [`Период: ${period}`];

  if (summary.bySeller && summary.sellers?.length) {
    lines.push(`Общ оборот: ${fmt(summary.grandTotal)}`);
    if (isSuperAdmin) {
      lines.push(`За изплащане (общо): ${fmt(summary.grandPayout)}`);
    }
    lines.push(`\nДоставчици (${summary.sellers.length}):`);
    for (const s of summary.sellers) {
      lines.push(`  • ${s.sellerName}: оборот ${fmt(s.sellerTotal)}, изплащане ${fmt(s.sellerPayout)}`);
      const topProducts = (s.items ?? [])
          .sort((a, b) => b.totalRevenue - a.totalRevenue)
          .slice(0, 3);
      for (const item of topProducts) {
        lines.push(`    - ${productName(item.product)}: ${item.totalQuantity} бр., ${fmt(item.totalRevenue)}`);
      }
    }
  } else if (summary.items?.length) {
    lines.push(`Общ оборот: ${fmt(summary.grandTotal)}`);
    lines.push(`\nПродукти:`);
    for (const item of summary.items) {
      lines.push(`  • ${productName(item.product)}: ${item.totalQuantity} бр., ${fmt(item.totalRevenue)}`);
    }
  } else {
    return null;
  }

  return `Ти си бизнес асистент. Анализирай следните данни за клиентски поръчки и дай кратко, полезно обобщение на български. Бъди директен и конкретен. Максимум 3 изречения. Без markdown форматиране.\n\n${lines.join("\n")}`;
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Не сте оторизирани." }, { status: 401 });

    const role = session.user.role;
    const isSuperAdmin = role === "Super Admin";
    const allowed = ["Admin", "Super Admin", "Seller"].includes(role);
    if (!allowed) return NextResponse.json({ message: "Нямате достъп." }, { status: 403 });

    const body = await request.json();
    const { summary, period } = body;

    const prompt = buildPrompt({ summary, period, isSuperAdmin });
    if (!prompt) return NextResponse.json({ text: "Няма достатъчно данни за анализ." });

    // Извикване на AI модела с правилния идентификатор и обработка на грешки
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      maxTokens: 256,
    });

    return NextResponse.json({ text });

  } catch (error) {
    console.error("AI Summary Error:", error);

    // Връщаме приятелско съобщение вместо 500 грешка със стек
    return NextResponse.json(
        { text: "В момента не можем да генерираме анализ. Моля, проверете данните ръчно." },
        { status: 500 }
    );
  }
}