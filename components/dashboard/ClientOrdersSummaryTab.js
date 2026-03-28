"use client";
import { useState } from "react";
import { observer } from "mobx-react-lite";
import { Button, DatePicker } from "@heroui/react";
import { now, getLocalTimeZone, toCalendarDateTime } from "@internationalized/date";
import { FiFilter, FiTrendingUp, FiDollarSign, FiCheckCircle, FiTruck, FiZap } from "react-icons/fi";
import { productTitle, formatCurrency } from "@/utils";
import { clientOrderStore } from "@/stores/useStore";

const PERIOD_LABELS = {
  "24h": "последните 24 часа",
  "today": "днес",
  "yesterday": "вчера",
  "week": "тази седмица",
  "month": "този месец",
  "all": "всички времена",
  "custom": "избран период",
};

const ClientOrdersSummaryTab = ({
  summary, isSummaryLoading, isSuperAdmin,
  summaryPreset, setSummaryPreset, applyFilter,
  customFrom, setCustomFrom, customTo, setCustomTo,
  onPayoutTrigger,
}) => {
  const [aiInsight, setAiInsight] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    setAiInsight(null);
    try {
      const res = await fetch("/api/client-orders/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary, period: PERIOD_LABELS[summaryPreset] ?? summaryPreset }),
      });
      const data = await res.json();
      setAiInsight(data.text ?? "Неуспешен анализ.");
    } catch {
      setAiInsight("Грешка при анализа. Провери API ключа.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const grandCost = summary?.bySeller && summary?.sellers
    ? summary.sellers.reduce((s, sel) => s + sel.items.reduce((si, item) => si + (item.product?.price ?? 0) * item.totalQuantity, 0), 0)
    : 0;
  const grandDistributorPayout = summary?.grandDistributorPayout ?? 0;
  const grandNetRevenue = (summary?.grandTotal ?? 0) - (summary?.grandPayout ?? 0) - grandDistributorPayout;
  const grandProfit = grandNetRevenue - grandCost;

  return (
  <>
    {/* ФИЛТЪР ПАНЕЛ */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-[#0071f5]/10 flex items-center justify-center">
          <FiFilter className="w-3.5 h-3.5 text-[#0071f5]" />
        </div>
        <span className="text-sm font-bold text-slate-700">Период</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: "24h",       label: "24 часа" },
          { key: "today",     label: "Днес" },
          { key: "yesterday", label: "Вчера" },
          { key: "week",      label: "Тази седмица" },
          { key: "month",     label: "Този месец" },
          { key: "all",       label: "Всички" },
          { key: "custom",    label: "По избор" },
        ].map(({ key, label }) => (
          <Button
            key={key}
            size="sm"
            radius="full"
            variant={summaryPreset === key ? "solid" : "flat"}
            color={summaryPreset === key ? "primary" : "default"}
            onPress={() => {
              setSummaryPreset(key);
              if (key !== "custom") {
                applyFilter(key);
              } else {
                const nowDT = toCalendarDateTime(now(getLocalTimeZone()));
                if (!customFrom) setCustomFrom(nowDT);
                if (!customTo) setCustomTo(nowDT);
              }
            }}
            className={`font-semibold text-xs ${summaryPreset !== key ? "text-slate-500" : ""}`}>
            {label}
          </Button>
        ))}
      </div>

      {summaryPreset === "custom" && (
        <div className="flex flex-wrap items-end gap-3 mt-4 pt-4 border-t border-gray-100">
          <DatePicker
            label="От"
            granularity="minute"
            locale="bg-BG"
            hourCycle={24}
            value={customFrom}
            onChange={setCustomFrom}
            size="sm"
            radius="lg"
            className="w-56"
          />
          <DatePicker
            label="До"
            granularity="minute"
            locale="bg-BG"
            hourCycle={24}
            value={customTo}
            onChange={setCustomTo}
            minValue={customFrom ?? undefined}
            size="sm"
            radius="lg"
            className="w-56"
          />
          <Button
            size="sm"
            color="primary"
            radius="lg"
            className="font-semibold"
            onPress={() => applyFilter("custom", customFrom, customTo)}>
            Приложи
          </Button>
        </div>
      )}
    </div>

    {/* AI АНАЛИЗ */}
    {!isSummaryLoading && summary?.grandTotal > 0 && (
      <div className="mb-5">
        {aiInsight ? (
          <div className="bg-gradient-to-br from-[#0071f5]/5 to-purple-50 rounded-2xl border border-[#0071f5]/10 px-4 py-4 flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#0071f5]/10 flex items-center justify-center shrink-0 mt-0.5">
              <FiZap className="w-3.5 h-3.5 text-[#0071f5]" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-[#0071f5] mb-1">AI Обобщение</p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{aiInsight}</p>
              <button
                onClick={() => { setAiInsight(null); handleAiAnalysis(); }}
                className="mt-2 text-xs text-slate-400 hover:text-[#0071f5] transition-colors">
                Обнови анализа
              </button>
            </div>
          </div>
        ) : (
          <Button
            size="sm"
            variant="flat"
            radius="lg"
            isLoading={isAnalyzing}
            onPress={handleAiAnalysis}
            startContent={!isAnalyzing && <FiZap className="w-3.5 h-3.5" />}
            className="font-semibold text-[#0071f5] bg-[#0071f5]/8">
            {isAnalyzing ? "Анализирам..." : "AI Обобщение"}
          </Button>
        )}
      </div>
    )}

    {isSummaryLoading ? (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#0071f5] border-t-transparent animate-spin" />
        <span className="text-sm text-slate-400 font-medium">Зареждане...</span>
      </div>
    ) : summary?.bySeller ? (
      !summary?.sellers?.length ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-1">
            <FiTrendingUp className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-400">Няма доставени поръчки</p>
          <p className="text-xs text-slate-300">за избрания период</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* GRAND TOTAL КАРТИ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0071f5]/10 flex items-center justify-center shrink-0">
                <FiTrendingUp className="w-4.5 h-4.5 text-[#0071f5]" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Общ оборот</p>
                <p className="text-base font-bold text-[#0071f5]">{formatCurrency(summary.grandTotal, 2)}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <FiTruck className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Доставки</p>
                <p className="text-base font-bold text-slate-700">{formatCurrency(summary.sellers?.reduce((s, x) => s + (x.sellerDelivery ?? 0), 0) ?? 0, 2)}</p>
              </div>
            </div>
            {isSuperAdmin && (
              <div className="bg-white rounded-2xl shadow-sm border border-orange-100 px-4 py-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  <FiDollarSign className="w-4.5 h-4.5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-orange-400 font-medium">За изплащане</p>
                  <p className="text-base font-bold text-orange-500">{formatCurrency(summary.grandPayout, 2)}</p>
                </div>
              </div>
            )}
            {isSuperAdmin && (
              <div className="bg-white rounded-2xl shadow-sm border border-green-100 px-4 py-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <FiCheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-green-500 font-medium">Изплатени</p>
                  <p className="text-base font-bold text-green-600">{formatCurrency(summary.grandPaidPayout ?? 0, 2)}</p>
                </div>
              </div>
            )}
          </div>

          {isSuperAdmin && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl shadow-sm border border-purple-100 px-4 py-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                  <FiDollarSign className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-purple-400 font-medium">Нето оборот</p>
                  <p className="text-base font-bold text-purple-600">{formatCurrency(grandNetRevenue, 2)}</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 px-4 py-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <FiTrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-emerald-500 font-medium">Печалба</p>
                  <p className="text-base font-bold text-emerald-600">{formatCurrency(grandProfit, 2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* ДОСТАВЧИЦИ */}
          {summary.sellers.map((seller) => (
            <div key={seller._id ?? "unassigned"} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-[#0071f5]/5 to-transparent border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#0071f5] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {seller.sellerName?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{seller.sellerName}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs font-semibold text-[#0071f5]">{formatCurrency(seller.sellerTotal, 2)}</span>
                      {seller.sellerDelivery > 0 && <span className="text-xs text-slate-300">·</span>}
                      {seller.sellerDelivery > 0 && <span className="text-xs font-semibold text-slate-500">{formatCurrency(seller.sellerDelivery, 2)} дост.</span>}
                      {isSuperAdmin && <span className="text-xs text-slate-300">·</span>}
                      {isSuperAdmin && <span className="text-xs font-semibold text-orange-500">{formatCurrency(seller.sellerPayout, 2)} за изпл.</span>}
                    </div>
                  </div>
                </div>
                {isSuperAdmin && seller._id && seller.sellerUnpaidCount > 0 && (
                  <Button
                    size="sm"
                    color="warning"
                    variant="solid"
                    radius="full"
                    startContent={<FiCheckCircle className="w-3.5 h-3.5" />}
                    onPress={() => onPayoutTrigger(seller)}
                    className="text-white font-semibold text-xs">
                    Изплати
                  </Button>
                )}
                {isSuperAdmin && seller._id && seller.sellerUnpaidCount === 0 && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                    <FiCheckCircle className="w-3 h-3" />
                    Изплатен
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <div className={isSuperAdmin ? "min-w-[900px]" : "min-w-[400px]"}>
                  <div className={`grid px-4 py-2 border-b border-gray-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest ${isSuperAdmin ? "grid-cols-8" : "grid-cols-4"}`}>
                    <span>Продукт</span>
                    <span className="text-center">Бройки</span>
                    <span className="text-right">Оборот</span>
                    <span className="text-right">Доставка</span>
                    {isSuperAdmin && <span className="text-right">За изплащане</span>}
                    {isSuperAdmin && <span className="text-right text-orange-400">Дистрибутор</span>}
                    {isSuperAdmin && <span className="text-right">Нето</span>}
                    {isSuperAdmin && <span className="text-right">Печалба</span>}
                  </div>

                  {seller.items
                    .slice()
                    .sort((a, b) => b.totalRevenue - a.totalRevenue)
                    .map((item, i) => {
                      const distPayout = item.totalDistributorPayout ?? 0;
                      const neto = item.totalRevenue - item.totalPayout - distPayout;
                      const profit = neto - (item.product?.price ?? 0) * item.totalQuantity;
                      return (
                        <div key={i} className={`grid px-4 py-3 border-b border-gray-50 last:border-0 items-center group hover:bg-blue-50/30 transition-colors ${isSuperAdmin ? "grid-cols-8" : "grid-cols-4"}`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm font-medium text-slate-700 truncate">{productTitle(item.product)}</span>
                            <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${item.unpaidCount === 0 ? "bg-green-50 text-green-600 border-green-100" : "bg-gray-50 text-gray-400 border-gray-100"}`}>
                              {item.unpaidCount === 0 ? "✓" : "○"}
                            </span>
                          </div>
                          <span className="text-sm text-slate-500 text-center tabular-nums">{item.totalQuantity} бр.</span>
                          <span className="text-sm font-semibold text-slate-700 text-right tabular-nums">{formatCurrency(item.totalRevenue, 2)}</span>
                          <span className="text-sm font-semibold text-slate-700 text-right tabular-nums">{item.totalDelivery > 0 ? formatCurrency(item.totalDelivery, 2) : "—"}</span>
                          {isSuperAdmin && <span className={`text-sm font-semibold text-right tabular-nums ${item.unpaidCount === 0 ? "text-green-600" : "text-orange-500"}`}>{formatCurrency(item.totalPayout, 2)}</span>}
                          {isSuperAdmin && <span className="text-sm font-semibold text-orange-400 text-right tabular-nums">{distPayout > 0 ? formatCurrency(distPayout, 2) : "—"}</span>}
                          {isSuperAdmin && <span className="text-sm font-semibold text-purple-600 text-right tabular-nums">{formatCurrency(neto, 2)}</span>}
                          {isSuperAdmin && <span className="text-sm font-semibold text-emerald-600 text-right tabular-nums">{formatCurrency(profit, 2)}</span>}
                        </div>
                      );
                    })}

                  <div className={`grid px-4 py-3 bg-slate-50/80 border-t border-gray-100 items-center ${isSuperAdmin ? "grid-cols-8" : "grid-cols-4"}`}>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Общо</span>
                    <span />
                    <span className="text-sm font-bold text-slate-800 text-right tabular-nums">{formatCurrency(seller.sellerTotal, 2)}</span>
                    <span className="text-sm font-bold text-slate-700 text-right tabular-nums">{seller.sellerDelivery > 0 ? formatCurrency(seller.sellerDelivery, 2) : "—"}</span>
                    {isSuperAdmin && <span className={`text-sm font-bold text-right tabular-nums ${seller.sellerUnpaidCount === 0 ? "text-green-600" : "text-orange-500"}`}>{formatCurrency(seller.sellerPayout, 2)}</span>}
                    {isSuperAdmin && <span className="text-sm font-bold text-orange-400 text-right tabular-nums">{(seller.sellerDistributorPayout ?? 0) > 0 ? formatCurrency(seller.sellerDistributorPayout, 2) : "—"}</span>}
                    {isSuperAdmin && <span className="text-sm font-bold text-purple-600 text-right tabular-nums">{formatCurrency(seller.sellerTotal - seller.sellerPayout - (seller.sellerDistributorPayout ?? 0), 2)}</span>}
                    {isSuperAdmin && <span className="text-sm font-bold text-emerald-600 text-right tabular-nums">{formatCurrency(seller.sellerTotal - seller.sellerPayout - (seller.sellerDistributorPayout ?? 0) - seller.items.reduce((s, i) => s + (i.product?.price ?? 0) * i.totalQuantity, 0), 2)}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    ) : (
      !summary?.items?.length ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-1">
            <FiTrendingUp className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-400">Няма доставени поръчки</p>
          <p className="text-xs text-slate-300">за избрания период</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0071f5]/10 flex items-center justify-center shrink-0">
                <FiTrendingUp className="w-4 h-4 text-[#0071f5]" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Общ оборот</p>
                <p className="text-base font-bold text-[#0071f5]">{formatCurrency(summary.grandTotal, 2)}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <FiTruck className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Доставки</p>
                <p className="text-base font-bold text-slate-700">{formatCurrency(summary.grandDelivery ?? 0, 2)}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-green-100 px-4 py-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <FiCheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-green-500 font-medium">Изплатени</p>
                <p className="text-base font-bold text-green-600">{formatCurrency(summary.grandPaidPayout ?? 0, 2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[400px]">
                <div className="grid grid-cols-4 px-4 py-2 border-b border-gray-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Продукт</span>
                  <span className="text-center">Бройки</span>
                  <span className="text-right">Оборот</span>
                  <span className="text-right">Доставка</span>
                </div>

                {summary.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-4 px-4 py-3 border-b border-gray-50 last:border-0 items-center hover:bg-blue-50/30 transition-colors">
                    <span className="text-sm font-medium text-slate-700">{productTitle(item.product)}</span>
                    <span className="text-sm text-slate-500 text-center tabular-nums">{item.totalQuantity} бр.</span>
                    <span className="text-sm font-semibold text-slate-700 text-right tabular-nums">{formatCurrency(item.totalRevenue, 2)}</span>
                    <span className="text-sm font-semibold text-slate-700 text-right tabular-nums">{item.totalDelivery > 0 ? formatCurrency(item.totalDelivery, 2) : "—"}</span>
                  </div>
                ))}

                <div className="grid grid-cols-4 px-4 py-3 bg-slate-50/80 border-t border-gray-100 items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Общо</span>
                  <span />
                  <span className="text-sm font-bold text-[#0071f5] text-right tabular-nums">{formatCurrency(summary.grandTotal, 2)}</span>
                  <span className="text-sm font-bold text-slate-700 text-right tabular-nums">{summary.grandDelivery > 0 ? formatCurrency(summary.grandDelivery, 2) : "—"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    )}
  </>
  );
};

export default observer(ClientOrdersSummaryTab);
