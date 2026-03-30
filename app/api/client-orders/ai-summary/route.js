import { getAuth } from "@/helpers/getAuth";
import { NextResponse } from "next/server";
import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

function fmt(n) {
  return Number(n ?? 0).toFixed(2) + " €";
}

function productName(p) {
  if (!p) return "Непознат";
  const parts = [p.name, p.weight, p.flavor, p.puffs ? `${p.puffs} puffs` : null, p.count ? `x${p.count}` : null];
  return parts.filter(Boolean).join(" ");
}

function buildPrompt({ summary, period, isSuperAdmin }) {
  const lines = [`ПЕРИОД: ${period}`];

  if (summary.bySeller && summary.sellers?.length) {
    const totalDelivery = summary.sellers.reduce((s, x) => s + (x.sellerDelivery ?? 0), 0);
    lines.push(`Общ оборот: ${fmt(summary.grandTotal)}`);
    lines.push(`Общо доставки: ${fmt(totalDelivery)}`);
    if (isSuperAdmin) {
      lines.push(`За изплащане на доставчици: ${fmt(summary.grandPayout)}`);
      lines.push(`Нето приход (оборот - изплащания): ${fmt(summary.grandTotal - summary.grandPayout)}`);
    }
    lines.push(`\nДОСТАВЧИЦИ (${summary.sellers.length}):`);
    for (const s of summary.sellers) {
      const pct = summary.grandTotal > 0 ? ((s.sellerTotal / summary.grandTotal) * 100).toFixed(1) : "0";
      lines.push(`\n${s.sellerName}: ${fmt(s.sellerTotal)} (${pct}% от оборота)`);
      if (isSuperAdmin) lines.push(`  За изплащане: ${fmt(s.sellerPayout)}, Неизплатени: ${s.sellerUnpaidCount} бр.`);
      const sorted = (s.items ?? []).sort((a, b) => b.totalRevenue - a.totalRevenue);
      for (const item of sorted) {
        lines.push(`  - ${productName(item.product)}: ${item.totalQuantity} бр. × ${fmt(item.totalRevenue / (item.totalQuantity || 1))} = ${fmt(item.totalRevenue)}`);
      }
    }
  } else if (summary.items?.length) {
    lines.push(`Общ оборот: ${fmt(summary.grandTotal)}`);
    lines.push(`Общо доставки: ${fmt(summary.grandDelivery ?? 0)}`);
    lines.push(`\nПРОДУКТИ:`);
    for (const item of summary.items) {
      const pct = summary.grandTotal > 0 ? ((item.totalRevenue / summary.grandTotal) * 100).toFixed(1) : "0";
      lines.push(`  - ${productName(item.product)}: ${item.totalQuantity} бр., ${fmt(item.totalRevenue)} (${pct}%)`);
    }
  } else {
    return null;
  }

  return `Ти си бизнес асистент. Анализирай данните и върни САМО форматиран отчет на БЪЛГАРСКИ. Без обяснения, без уводни изречения — само самия отчет.

ФОРМАТ (използвай точно тези емоджи и структура, всеки ред на нов ред):
📊 [оборот] · Доставки: [сума] · Нето: [оборот минус изплащания ако има]
👥 [брой доставчика] доставчика  ← само ако има bySeller данни
🥇 [Име] — [сума] ([%]) · Неизплатени: [N]  ← топ доставчик (само ако има bySeller)
🥈 [Име] — [сума] ([%])  ← втори (само ако има)
🥉 [Име] — [сума] ([%])  ← трети (само ако има)
🏆 Топ продукт: [продукт] — [бр.] бр., [сума] ([%])
💡 [една кратка бележка или препоръка само ако има ясен извод — иначе пропусни реда]

ПРАВИЛА:
- Всички суми са в ЕВРО (€) — копирай ги точно от данните
- Без markdown (без **, без ##, без -)
- Без обяснения преди или след отчета
- Пропускай редове за които няма данни
- Максимум 8 реда

ДАННИ:
${lines.join("\n")}`;
}

export async function POST(request) {
  try {
    const session = await getAuth(request);
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
      model: groq("llama-3.1-8b-instant"),
      prompt,
      maxTokens: 400,
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