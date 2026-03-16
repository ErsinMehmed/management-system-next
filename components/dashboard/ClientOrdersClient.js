"use client";
import React, { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useSession } from "next-auth/react";
import Layout from "@/components/layout/Dashboard";
import Modal from "@/components/Modal";
import Pagination from "@/components/table/Pagination";
import ClientOrderForm from "@/components/forms/ClientOrder";
import { useDisclosure, Tabs, Tab, Button, DatePicker, Accordion, AccordionItem } from "@heroui/react";
import { parseAbsoluteToLocal, getLocalTimeZone, now } from "@internationalized/date";
import Link from "next/link";
import { FiPlus, FiTrash2, FiRefreshCw, FiEye, FiEyeOff, FiCheckCircle, FiFilter, FiTrendingUp, FiDollarSign, FiPhone, FiMapPin, FiFileText, FiUser, FiPackage, FiXCircle, FiTruck } from "react-icons/fi";
import { productTitle, formatCurrency } from "@/utils";
import { clientOrderStore, commonStore, productStore } from "@/stores/useStore";
import Select from "@/components/html/Select";

const STATUSES = ["нова", "доставена", "отказана"];

const STATUS_STYLES = {
  нова: "bg-blue-100 text-blue-700",
  доставена: "bg-green-100 text-green-700",
  отказана: "bg-red-100 text-red-700",
};

const STATUS_ACCENT = {
  нова: "bg-blue-500",
  доставена: "bg-green-500",
  отказана: "bg-red-500",
};


const STATUS_ICON = {
  нова: FiPhone,
  доставена: FiTruck,
  отказана: FiXCircle,
};

const ClientOrdersClient = ({ initialData, sellers = [] }) => {
  const { data: session } = useSession();
  const isAdmin = ["Admin", "Super Admin"].includes(session?.user?.role);
  const isSuperAdmin = session?.user?.role === "Super Admin";
  const { orders, orderData, isLoading, isCreating, handlePageChange, handlePageClick, summary, isSummaryLoading, history, isHistoryLoading } = clientOrderStore;
  const { products } = productStore;
  const { errorFields } = commonStore;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isRejectionOpen, onOpen: onRejectionOpen, onOpenChange: onRejectionOpenChange } = useDisclosure();
  const [deletingId, setDeletingId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingRejection, setPendingRejection] = useState({ orderId: null, reason: "" });
  const [activeTab, setActiveTab] = useState("orders");
  const [summaryPreset, setSummaryPreset] = useState("24h");
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);
  const { isOpen: isPayoutOpen, onOpen: onPayoutOpen, onOpenChange: onPayoutOpenChange } = useDisclosure();
  const [pendingPayout, setPendingPayout] = useState(null);
  const [isPayingOut, setIsPayingOut] = useState(false);

  useEffect(() => {
    if (initialData) {
      clientOrderStore.hydrateOrders(initialData.orders);
      return;
    }
    clientOrderStore.loadOrders();
  }, []);

  const updatedProducts = useMemo(() => {
    return products
      .filter((p) => !p.hidden)
      .map((p) => ({ ...p, name: productTitle(p) }));
  }, [products]);

  const handleFieldChange = (name, value) => {
    if (name === "product") {
      const selected = updatedProducts.find((p) => p._id === value);
      const qty = Number(orderData.quantity);
      const autoPrice = selected?.sell_prices?.[qty - 1] ?? "";
      clientOrderStore.setOrderData({ ...orderData, product: value, price: autoPrice });
    } else if (name === "quantity") {
      const qty = Number(value);
      const selected = updatedProducts.find((p) => p._id === orderData.product);
      const autoPrice = selected?.sell_prices?.[qty - 1] ?? "";
      clientOrderStore.setOrderData({ ...orderData, quantity: value, price: autoPrice });
    } else {
      clientOrderStore.setOrderData({ ...orderData, [name]: value });
    }
  };

  const computeRange = (preset, cfrom = customFrom, cto = customTo) => {
    const now = new Date();
    switch (preset) {
      case "24h":   return { from: new Date(now - 24 * 60 * 60 * 1000).toISOString(), to: now.toISOString() };
      case "today": { const s = new Date(now); s.setHours(0, 0, 0, 0); return { from: s.toISOString(), to: now.toISOString() }; }
      case "yesterday": {
        const s = new Date(now); s.setDate(s.getDate() - 1); s.setHours(0, 0, 0, 0);
        const e = new Date(now); e.setDate(e.getDate() - 1); e.setHours(23, 59, 59, 999);
        return { from: s.toISOString(), to: e.toISOString() };
      }
      case "week": {
        const s = new Date(now);
        const day = s.getDay();
        s.setDate(s.getDate() - (day === 0 ? 6 : day - 1));
        s.setHours(0, 0, 0, 0);
        return { from: s.toISOString(), to: now.toISOString() };
      }
      case "month": {
        const s = new Date(now.getFullYear(), now.getMonth(), 1);
        return { from: s.toISOString(), to: now.toISOString() };
      }
      case "all":    return { from: null, to: null };
      case "custom": return { from: cfrom ? cfrom.toDate(getLocalTimeZone()).toISOString() : null, to: cto ? cto.toDate(getLocalTimeZone()).toISOString() : null };
      default:       return { from: null, to: null };
    }
  };

  const applyFilter = (preset, cfrom = customFrom, cto = customTo) => {
    const { from, to } = computeRange(preset, cfrom, cto);
    clientOrderStore.loadSummary(from, to);
  };

  const handleCreate = async () => {
    return await clientOrderStore.createOrder();
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    await clientOrderStore.deleteOrder(id);
    setDeletingId(null);
  };

  return (
    <Layout title="Заявки">
      <div className="min-h-screen 2xl:px-10">
        <Tabs
          aria-label="Заявки табове"
          selectedKey={activeTab}
          onSelectionChange={(key) => {
            setActiveTab(key);
            if (key === "summary") applyFilter(summaryPreset);
            if (key === "history") clientOrderStore.loadHistory();
          }}
          classNames={{ tabList: "mb-4" }}>

          {/* ТАБ 1: Списък */}
          <Tab key="orders" title="Заявки">
            <div className="flex flex-col sm:flex-row justify-center sm:justify-end items-center gap-2 mb-4">
              <Button
                variant="solid"
                color="primary"
                radius="full"
                size="sm"
                isLoading={isRefreshing}
                startContent={!isRefreshing && <FiRefreshCw className="w-4 h-4" />}
                onPress={async () => {
                  setIsRefreshing(true);
                  await clientOrderStore.loadOrders();
                  setIsRefreshing(false);
                }}
                className="w-full sm:w-auto font-semibold">
                Презареди
              </Button>

              {(isAdmin || session?.user?.role === "Seller") && (
                <Button
                  variant="solid"
                  color="primary"
                  radius="full"
                  size="sm"
                  startContent={<FiPlus className="w-4 h-4" />}
                  onPress={onOpen}
                  className="w-full sm:w-auto font-semibold">
                  Добави
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#0071f5] border-t-transparent animate-spin" />
                <span className="text-sm text-slate-400 font-medium">Зареждане...</span>
              </div>
            ) : orders?.items?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-1">
                  <FiPackage className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-400">Няма поръчки</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {orders?.items?.map((order) => (
                  <div key={order._id} className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">

                    {/* Цветна лента */}
                    <div className={`h-1 w-full ${STATUS_ACCENT[order.status] ?? "bg-slate-300"}`} />

                    <Link href={`/dashboard/client-orders/${order._id}`} className="px-4 pt-3.5 pb-3 flex flex-col gap-3 flex-1">

                      {/* Ред 1: телефон + статус */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-slate-100">
                            {(() => { const Icon = STATUS_ICON[order.status] ?? FiPhone; return <Icon className="w-3.5 h-3.5 text-slate-400" />; })()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-base leading-tight">{order.phone}</p>
                            <span className={`text-xs font-semibold ${order.isNewClient ? "text-green-600" : "text-slate-400"}`}>
                              {order.isNewClient ? "✦ Нов клиент" : "Съществуващ"}
                            </span>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${STATUS_STYLES[order.status]}`}>
                          {order.status}
                        </span>
                      </div>

                      {/* Ред 2: продукт + метрики */}
                      <div className="bg-slate-50 rounded-xl px-3 py-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <FiPackage className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="text-sm font-semibold text-slate-700 truncate">{order.product?.name ?? "—"}</span>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="text-sm text-slate-400 tabular-nums">{order.quantity} бр.</span>
                          <span className="text-sm font-bold text-[#0071f5] tabular-nums">{formatCurrency(order.price, 2)}</span>
                        </div>
                      </div>

                      {/* Ред 3: мета инфо */}
                      {(order.address || order.note || order.assignedTo?.name) && (
                        <div className="flex flex-col gap-1.5 border-t border-gray-50 pt-2.5">
                          {order.address && (
                            <div className="flex items-center gap-1.5 text-sm text-slate-400">
                              <FiMapPin className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{order.address}</span>
                            </div>
                          )}
                          {order.note && (
                            <div className="flex items-center gap-1.5 text-sm text-slate-400">
                              <FiFileText className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{order.note}</span>
                            </div>
                          )}
                          {order.assignedTo?.name && (
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 text-sm text-slate-400">
                                <FiUser className="w-3.5 h-3.5 shrink-0" />
                                <span>{order.assignedTo.name}</span>
                              </div>
                              {isSuperAdmin && (
                                <span className={`flex items-center gap-1 text-xs font-semibold ${order.viewedBySeller ? "text-green-500" : "text-gray-300"}`}>
                                  {order.viewedBySeller ? <FiEye className="w-3.5 h-3.5" /> : <FiEyeOff className="w-3.5 h-3.5" />}
                                  {order.viewedBySeller ? "Видяна" : "Не е видяна"}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </Link>

                    {isAdmin && (
                      <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-50 gap-2">
                        <Select
                          controlled
                          value={order.status}
                          disabled={["отказана", "доставена"].includes(order.status) && !isSuperAdmin}
                          items={STATUSES.map((s) => ({ _id: s, value: s, name: s }))}
                          onChange={(val) => {
                            if (val === "отказана") {
                              setPendingRejection({ orderId: order._id, reason: "" });
                              onRejectionOpen();
                            } else {
                              clientOrderStore.updateStatus(order._id, val);
                            }
                          }}
                          baseClass="w-36"
                          classes={`text-xs font-semibold rounded-lg cursor-pointer w-auto min-w-0 ${STATUS_STYLES[order.status]} ${["отказана", "доставена"].includes(order.status) && !isSuperAdmin ? "opacity-60 pointer-events-none" : ""}`}
                        />
                        <Button
                          isIconOnly
                          variant="light"
                          color="danger"
                          size="sm"
                          isLoading={deletingId === order._id}
                          onPress={() => handleDelete(order._id)}>
                          <FiTrash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <Pagination
                isLoading={isLoading}
                currentPage={orders.pagination?.current_page}
                totalPages={orders.pagination?.total_pages}
                totalItems={orders.pagination?.total_results}
                perPage={orders.pagination?.per_page}
                handlePrevPage={handlePageChange}
                handleNextPage={() => handlePageChange("next")}
                handlePageClick={handlePageClick}
              />
            </div>
          </Tab>

          {/* ТАБ 2: Обобщение */}
          <Tab key="summary" title="Обобщение">

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
                      if (key !== "custom") applyFilter(key);
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
                    maxValue={customTo ?? now(getLocalTimeZone())}
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
                    maxValue={now(getLocalTimeZone())}
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
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3.5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#0071f5]/10 flex items-center justify-center shrink-0">
                        <FiTrendingUp className="w-4.5 h-4.5 text-[#0071f5]" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Общ оборот</p>
                        <p className="text-base font-bold text-[#0071f5]">{formatCurrency(summary.grandTotal, 2)}</p>
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
                  </div>

                  {/* ДОСТАВЧИЦИ */}
                  {summary.sellers.map((seller) => (
                    <div key={seller._id ?? "unassigned"} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                      {/* Хедър */}
                      <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-[#0071f5]/5 to-transparent border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#0071f5] flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {seller.sellerName?.charAt(0)?.toUpperCase() ?? "?"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{seller.sellerName}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-semibold text-[#0071f5]">{formatCurrency(seller.sellerTotal, 2)}</span>
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
                            onPress={() => { setPendingPayout(seller); onPayoutOpen(); }}
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

                      {/* Колони */}
                      <div className={`grid px-4 py-2 border-b border-gray-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest ${isSuperAdmin ? "grid-cols-4" : "grid-cols-3"}`}>
                        <span>Продукт</span>
                        <span className="text-center">Бройки</span>
                        <span className="text-right">Оборот</span>
                        {isSuperAdmin && <span className="text-right">За изплащане</span>}
                      </div>

                      {/* Редове */}
                      {seller.items
                        .slice()
                        .sort((a, b) => b.totalRevenue - a.totalRevenue)
                        .map((item, i) => (
                          <div key={i} className={`grid px-4 py-3 border-b border-gray-50 last:border-0 items-center group hover:bg-blue-50/30 transition-colors ${isSuperAdmin ? "grid-cols-4" : "grid-cols-3"}`}>
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-sm font-medium text-slate-700 truncate">{productTitle(item.product)}</span>
                              <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${item.unpaidCount === 0 ? "bg-green-50 text-green-600 border-green-100" : "bg-gray-50 text-gray-400 border-gray-100"}`}>
                                {item.unpaidCount === 0 ? "✓" : "○"}
                              </span>
                            </div>
                            <span className="text-sm text-slate-500 text-center tabular-nums">{item.totalQuantity} бр.</span>
                            <span className="text-sm font-semibold text-slate-700 text-right tabular-nums">{formatCurrency(item.totalRevenue, 2)}</span>
                            {isSuperAdmin && <span className="text-sm font-semibold text-orange-500 text-right tabular-nums">{formatCurrency(item.totalPayout, 2)}</span>}
                          </div>
                        ))}

                      {/* Тотал ред */}
                      <div className={`grid px-4 py-3 bg-slate-50/80 border-t border-gray-100 items-center ${isSuperAdmin ? "grid-cols-4" : "grid-cols-3"}`}>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Общо</span>
                        <span />
                        <span className="text-sm font-bold text-[#0071f5] text-right tabular-nums">{formatCurrency(seller.sellerTotal, 2)}</span>
                        {isSuperAdmin && <span className="text-sm font-bold text-orange-500 text-right tabular-nums">{formatCurrency(seller.sellerPayout, 2)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* Seller — само неговите */
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
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3.5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0071f5]/10 flex items-center justify-center shrink-0">
                      <FiTrendingUp className="w-4 h-4 text-[#0071f5]" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Общ оборот</p>
                      <p className="text-base font-bold text-[#0071f5]">{formatCurrency(summary.grandTotal, 2)}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-3 px-4 py-2 border-b border-gray-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>Продукт</span>
                      <span className="text-center">Бройки</span>
                      <span className="text-right">Оборот</span>
                    </div>

                    {summary.items.map((item, i) => (
                      <div key={i} className="grid grid-cols-3 px-4 py-3 border-b border-gray-50 last:border-0 items-center hover:bg-blue-50/30 transition-colors">
                        <span className="text-sm font-medium text-slate-700">{productTitle(item.product)}</span>
                        <span className="text-sm text-slate-500 text-center tabular-nums">{item.totalQuantity} бр.</span>
                        <span className="text-sm font-semibold text-slate-700 text-right tabular-nums">{formatCurrency(item.totalRevenue, 2)}</span>
                      </div>
                    ))}

                    <div className="grid grid-cols-3 px-4 py-3 bg-slate-50/80 border-t border-gray-100 items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Общо</span>
                      <span />
                      <span className="text-sm font-bold text-[#0071f5] text-right tabular-nums">{formatCurrency(summary.grandTotal, 2)}</span>
                    </div>
                  </div>
                </div>
              )
            )}
          </Tab>
          {/* ТАБ 3: История */}
          {isSuperAdmin && <Tab key="history" title="История">
            {isHistoryLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#0071f5] border-t-transparent animate-spin" />
                <span className="text-sm text-slate-400 font-medium">Зареждане...</span>
              </div>
            ) : !history?.sellers?.length ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-1">
                  <FiDollarSign className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-400">Няма изплатени суми</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">

                {/* GRAND SUMMARY */}
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
                  {isSuperAdmin && (
                    <div className="bg-white rounded-2xl shadow-sm border border-green-100 px-4 py-3.5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                        <FiDollarSign className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-green-500 font-medium">Общо изплатено</p>
                        <p className="text-base font-bold text-green-600">{formatCurrency(history.grandPayout, 2)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* SELLER АКОРДИОНИ */}
                <Accordion
                  variant="splitted"
                  className="gap-3 px-0"
                  itemClasses={{
                    base: "bg-white rounded-2xl shadow-sm border border-gray-100 !px-0 overflow-hidden",
                    heading: "px-4 py-0",
                    title: "text-sm w-full",
                    trigger: "py-4 data-[hover=true]:bg-transparent",
                    content: "pt-0 pb-0",
                  }}>
                  {history.sellers.map((seller, si) => (
                    <AccordionItem
                      key={si}
                      title={
                        <div className="flex items-center justify-between w-full pr-2 gap-4">
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
                            {isSuperAdmin && <span className="text-sm font-bold text-green-600 tabular-nums">{formatCurrency(seller.totalPayout, 2)} изпл.</span>}
                            <span className="text-xs text-slate-400 tabular-nums">{formatCurrency(seller.totalRevenue, 2)} оборот</span>
                          </div>
                        </div>
                      }>

                      {/* Плащания на доставчика */}
                      <div className="border-t border-gray-100 divide-y divide-gray-50">
                        {seller.payments.map((payment, pi) => {
                          const grouped = Object.values(
                            (payment.products ?? []).reduce((acc, p) => {
                              const key = p.name ?? "—";
                              if (!acc[key]) acc[key] = { name: key, quantity: 0, revenue: 0, payout: 0 };
                              acc[key].quantity += p.quantity ?? 0;
                              acc[key].revenue  += p.price   ?? 0;
                              acc[key].payout   += p.payout  ?? 0;
                              return acc;
                            }, {})
                          ).sort((a, b) => b.revenue - a.revenue);

                          return (
                            <div key={pi}>
                              {/* Хедър на плащане */}
                              <div className="flex items-center justify-between px-4 py-3 bg-slate-50/60">
                                <div className="flex items-center gap-2">
                                  <FiCheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                  <span className="text-xs font-semibold text-slate-600">
                                    {payment.paidAt
                                      ? new Date(payment.paidAt).toLocaleDateString("bg-BG", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
                                      : "—"}
                                  </span>
                                  <span className="text-xs text-slate-400">· {payment.orderCount} поръчки</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  {isSuperAdmin && <span className="text-xs font-bold text-green-600 tabular-nums">{formatCurrency(payment.totalPayout, 2)}</span>}
                                  <span className="text-xs text-slate-400 tabular-nums">{formatCurrency(payment.totalRevenue, 2)}</span>
                                </div>
                              </div>

                              {/* Продукти */}
                              <div className={`grid px-4 py-1.5 text-[10px] font-bold text-slate-300 uppercase tracking-widest ${isSuperAdmin ? "grid-cols-4" : "grid-cols-3"}`}>
                                <span>Продукт</span>
                                <span className="text-center">Бройки</span>
                                <span className="text-right">Оборот</span>
                                {isSuperAdmin && <span className="text-right">Изплатено</span>}
                              </div>

                              {grouped.map((g, gi) => (
                                <div key={gi} className={`grid px-4 py-2 border-t border-gray-50 items-center hover:bg-slate-50/50 transition-colors ${isSuperAdmin ? "grid-cols-4" : "grid-cols-3"}`}>
                                  <div className="flex items-center gap-2 min-w-0">
                                    <FiPackage className="w-3 h-3 text-slate-300 shrink-0" />
                                    <span className="text-sm text-slate-700 truncate">{g.name}</span>
                                  </div>
                                  <span className="text-sm text-slate-400 text-center tabular-nums">{g.quantity} бр.</span>
                                  <span className="text-sm font-semibold text-slate-700 text-right tabular-nums">{formatCurrency(g.revenue, 2)}</span>
                                  {isSuperAdmin && <span className="text-sm font-semibold text-green-600 text-right tabular-nums">{formatCurrency(g.payout, 2)}</span>}
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>

                    </AccordionItem>
                  ))}
                </Accordion>

              </div>
            )}
          </Tab>}

        </Tabs>
      </div>

      <Modal
        isOpen={isPayoutOpen}
        onOpenChange={onPayoutOpenChange}
        title="Потвърди изплащане"
        primaryBtnText="Изплати"
        isLoading={isPayingOut}
        onSave={async () => {
          setIsPayingOut(true);
          await clientOrderStore.markSellerAsPaid(pendingPayout._id);
          setIsPayingOut(false);
          return true;
        }}>
        {pendingPayout && (
          <div className="flex flex-col gap-3 py-1">
            <p className="text-sm text-slate-600">
              Сигурни ли сте, че искате да отбележите всички неизплатени доставки на{" "}
              <span className="font-semibold text-slate-800">{pendingPayout.sellerName}</span> като изплатени?
            </p>
            <div className="flex items-center justify-between bg-orange-50 rounded-xl px-4 py-3 border border-orange-100">
              <span className="text-sm text-slate-600">За изплащане</span>
              <span className="text-base font-bold text-orange-500">{formatCurrency(pendingPayout.sellerUnpaidPayout, 2)}</span>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="Добави поръчка"
        isLoading={isCreating}
        onSave={handleCreate}>
        <ClientOrderForm
          data={orderData}
          errorFields={errorFields}
          products={updatedProducts}
          sellers={sellers}
          handleFieldChange={handleFieldChange}
        />
      </Modal>

      <Modal
        isOpen={isRejectionOpen}
        onOpenChange={onRejectionOpenChange}
        title="Причина за отказ"
        primaryBtnText="Потвърди"
        onSave={async () => {
          await clientOrderStore.updateStatus(pendingRejection.orderId, "отказана", pendingRejection.reason);
          return true;
        }}>
        <textarea
          value={pendingRejection.reason}
          onChange={(e) => setPendingRejection((prev) => ({ ...prev, reason: e.target.value }))}
          placeholder="Въведи причина за отказа..."
          rows={4}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </Modal>
    </Layout>
  );
};

export default observer(ClientOrdersClient);
