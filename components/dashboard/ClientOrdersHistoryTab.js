"use client";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Button, Accordion } from "@heroui/react";
import { FiDollarSign, FiTrendingUp, FiCheckCircle, FiPackage } from "react-icons/fi";
import { formatCurrency } from "@/utils";
import { clientOrderStore } from "@/stores/useStore";

const PAYMENTS_PAGE = 8;

const RevenueConfirmBadge = ({ payment, sellerId, isSuperAdmin }) => {
  if (payment.revenueConfirmed) {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg bg-green-100 text-green-700">
        <FiCheckCircle className="w-3 h-3" />
        Взет оборот
      </span>
    );
  }
  if (!isSuperAdmin) return null;
  return (
    <button
      onClick={(e) => { e.stopPropagation(); clientOrderStore.confirmRevenue(sellerId, payment.paidAt); }}
      className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg bg-slate-100 text-slate-400 hover:bg-blue-100 hover:text-blue-700 transition-colors">
      <FiCheckCircle className="w-3 h-3" />
      Взех оборота
    </button>
  );
};

const ClientOrdersHistoryTab = ({ history, isHistoryLoading, isSuperAdmin }) => {
  const [visiblePayments, setVisiblePayments] = useState({});
  const getVisibleCount = (si) => visiblePayments[si] ?? PAYMENTS_PAGE;
  const loadMorePayments = (si) => setVisiblePayments((prev) => ({ ...prev, [si]: (prev[si] ?? PAYMENTS_PAGE) + PAYMENTS_PAGE }));
  if (isHistoryLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#0071f5] border-t-transparent animate-spin" />
        <span className="text-sm text-slate-400 font-medium">Зареждане...</span>
      </div>
    );
  }

  if (!history?.sellers?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-1">
          <FiDollarSign className="w-6 h-6 text-slate-300" />
        </div>
        <p className="text-sm font-semibold text-slate-400">Няма изплатени суми</p>
      </div>
    );
  }

  if (history.isSeller) {
    return (
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0071f5]/10 flex items-center justify-center shrink-0">
              <FiTrendingUp className="w-4 h-4 text-[#0071f5]" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Общ оборот</p>
              <p className="text-base font-bold text-[#0071f5]">{formatCurrency(history.grandTotal, 2)}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-green-100 px-4 py-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <FiDollarSign className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-green-500 font-medium">Общо изплатено</p>
              <p className="text-base font-bold text-green-600">{formatCurrency(history.grandPayout, 2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {history.sellers[0]?.payments.map((payment, pi) => (
            <div key={pi} className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 last:border-0 hover:bg-slate-50/60 transition-colors gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <FiCheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700">
                    {payment.paidAt
                      ? new Date(payment.paidAt).toLocaleDateString("bg-BG", { day: "2-digit", month: "long", year: "numeric" })
                      : "—"}
                  </p>
                  <p className="text-xs text-slate-400">{payment.orderCount} поръчки · {formatCurrency(payment.totalRevenue, 2)} оборот</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-base font-bold text-green-600 tabular-nums">{formatCurrency(payment.totalPayout, 2)}</span>
                  <span className="text-xs font-semibold text-red-500 tabular-nums">дължи {formatCurrency(payment.totalRevenue - payment.totalPayout, 2)}</span>
                </div>
                <RevenueConfirmBadge payment={payment} sellerId={history.sellers[0]?.sellerId} isSuperAdmin={false} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0071f5]/10 flex items-center justify-center shrink-0">
            <FiTrendingUp className="w-4 h-4 text-[#0071f5]" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Общ оборот</p>
            <p className="text-base font-bold text-[#0071f5]">{formatCurrency(history.grandTotal, 2)}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 px-4 py-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <FiDollarSign className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-green-500 font-medium">Общо изплатено</p>
            <p className="text-base font-bold text-green-600">{formatCurrency(history.grandPayout, 2)}</p>
          </div>
        </div>
      </div>

      <Accordion className="flex flex-col gap-3 px-0">
        {history.sellers.map((seller, si) => {
          const unconfirmedRevenue = seller.payments
            .filter((p) => !p.revenueConfirmed)
            .reduce((sum, p) => sum + ((p.totalRevenue ?? 0) - (p.totalPayout ?? 0)), 0);
          return (
          <Accordion.Item
            key={si}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:border-[#0071f5]/20 hover:shadow-md data-[expanded]:shadow-lg data-[expanded]:border-[#0071f5]/30 transition-all">
            <Accordion.Heading className="px-4 py-0 overflow-hidden rounded-2xl">
              <Accordion.Trigger className="py-4 w-full flex items-center justify-between cursor-pointer hover:bg-transparent">
                <div className="flex items-center justify-between w-full sm:pr-2 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#0071f5] flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {seller.sellerName?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800">{seller.sellerName}</p>
                      <p className="text-xs text-slate-400">{seller.payments.length} плащания · {seller.orderCount} поръчки</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0 gap-0.5">
                    {isSuperAdmin && unconfirmedRevenue > 0 && (
                      <span className="text-sm font-bold text-red-500 tabular-nums">{formatCurrency(unconfirmedRevenue, 2)} дължи</span>
                    )}
                    {isSuperAdmin && <span className="text-xs font-semibold text-green-600 tabular-nums">{formatCurrency(seller.totalPayout, 2)} изпл.</span>}
                    {isSuperAdmin && seller.totalDelivery > 0 && <span className="text-xs font-semibold text-[#0071f5] tabular-nums">{formatCurrency(seller.totalDelivery, 2)} доставки</span>}
                    <span className="text-xs text-slate-400 tabular-nums">{formatCurrency(seller.totalRevenue, 2)} оборот</span>
                  </div>
                </div>
                <Accordion.Indicator className="shrink-0 ml-2" />
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              <Accordion.Body className="pt-0 pb-0 overflow-x-auto">
            <div className="border-t border-gray-100 divide-y divide-gray-50">
              {seller.payments.slice(0, getVisibleCount(si)).map((payment, pi) => {
                const grouped = Object.values(
                  (payment.products ?? []).reduce((acc, p) => {
                    const key = p.name ?? "—";
                    if (!acc[key]) acc[key] = {
                      name: key,
                      weight: p.weight, flavor: p.flavor, puffs: p.puffs, count: p.count,
                      quantity: 0, revenue: 0, payout: 0, delivery: 0,
                    };
                    acc[key].quantity += p.quantity     ?? 0;
                    acc[key].revenue  += p.price        ?? 0;
                    acc[key].payout   += p.payout       ?? 0;
                    acc[key].delivery += p.deliveryCost ?? 0;
                    return acc;
                  }, {})
                ).sort((a, b) => b.revenue - a.revenue);

                return (
                  <div key={pi}>
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50/60 gap-2" style={{ minWidth: isSuperAdmin ? 480 : 320 }}>
                      <div className="flex items-center gap-2 min-w-0">
                        <FiCheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        <span className="text-xs font-semibold text-slate-600 truncate">
                          {payment.paidAt
                            ? new Date(payment.paidAt).toLocaleDateString("bg-BG", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
                            : "—"}
                        </span>
                        <span className="text-xs text-slate-400 shrink-0">· {payment.orderCount} поръчки</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isSuperAdmin && payment.totalDelivery > 0 && <span className="text-xs font-semibold text-[#0071f5] tabular-nums">{formatCurrency(payment.totalDelivery, 2)} дост.</span>}
                        {isSuperAdmin && <span className="text-xs font-bold text-green-600 tabular-nums">{formatCurrency(payment.totalPayout, 2)}</span>}
                        <span className="text-xs text-slate-400 tabular-nums">{formatCurrency(payment.totalRevenue, 2)}</span>
                        <RevenueConfirmBadge payment={payment} sellerId={seller.sellerId} isSuperAdmin={isSuperAdmin} />
                      </div>
                    </div>

                    <div className={`grid px-4 py-1.5 text-[10px] font-bold text-slate-300 uppercase tracking-widest ${isSuperAdmin ? "grid-cols-5" : "grid-cols-3"}`}
                      style={{ minWidth: isSuperAdmin ? 480 : 320 }}>
                      <span>Продукт</span>
                      <span className="text-center">Бройки</span>
                      <span className="text-right">Оборот</span>
                      {isSuperAdmin && <span className="text-right">Доставка</span>}
                      {isSuperAdmin && <span className="text-right">Изплатено</span>}
                    </div>

                    {grouped.map((g, gi) => (
                      <div key={gi} className={`grid px-4 py-2 border-t border-gray-50 items-center hover:bg-slate-50/50 transition-colors ${isSuperAdmin ? "grid-cols-5" : "grid-cols-3"}`}
                        style={{ minWidth: isSuperAdmin ? 480 : 320 }}>
                        <div className="flex items-center gap-2 min-w-0">
                          <FiPackage className="w-3 h-3 text-slate-300 shrink-0" />
                          <span className="text-sm text-slate-700 truncate">
                            {[g.name, g.flavor, g.weight && `${g.weight}г`, g.puffs && `${g.puffs}k`, g.count && `${g.count}бр.`].filter(Boolean).join(" ")}
                          </span>
                        </div>
                        <span className="text-sm text-slate-400 text-center tabular-nums">{g.quantity} бр.</span>
                        <span className="text-sm font-semibold text-slate-700 text-right tabular-nums">{formatCurrency(g.revenue, 2)}</span>
                        {isSuperAdmin && <span className="text-sm font-semibold text-slate-700 text-right tabular-nums">{g.delivery > 0 ? formatCurrency(g.delivery, 2) : "—"}</span>}
                        {isSuperAdmin && <span className="text-sm font-semibold text-green-600 text-right tabular-nums">{formatCurrency(g.payout, 2)}</span>}
                      </div>
                    ))}
                  </div>
                );
              })}
              {seller.payments.length > getVisibleCount(si) && (
                <div className="px-4 py-3 flex justify-center border-t border-gray-50">
                  <Button
                    size="sm"
                    variant="ghost"
                    onPress={() => loadMorePayments(si)}
                    className="text-xs font-semibold text-slate-500 rounded-full">
                    Зареди още ({seller.payments.length - getVisibleCount(si)} останали)
                  </Button>
                </div>
              )}
            </div>
            </Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>
          );
        })}
      </Accordion>
    </div>
  );
};

export default observer(ClientOrdersHistoryTab);
