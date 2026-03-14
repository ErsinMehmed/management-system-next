"use client";
import React, { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useSession } from "next-auth/react";
import Layout from "@/components/layout/Dashboard";
import Modal from "@/components/Modal";
import Pagination from "@/components/table/Pagination";
import ClientOrderForm from "@/components/forms/ClientOrder";
import { useDisclosure, Tabs, Tab } from "@heroui/react";
import Link from "next/link";
import { FiPlus, FiTrash2, FiRefreshCw, FiEye, FiEyeOff } from "react-icons/fi";
import { productTitle, formatCurrency } from "@/utils";
import { clientOrderStore, commonStore, productStore } from "@/stores/useStore";
import Select from "@/components/html/Select";

const STATUSES = ["нова", "доставена", "отказана"];

const STATUS_STYLES = {
  нова: "bg-blue-100 text-blue-700",
  доставена: "bg-green-100 text-green-700",
  отказана: "bg-red-100 text-red-700",
};

const ClientOrdersClient = ({ initialData, sellers = [] }) => {
  const { data: session } = useSession();
  const isAdmin = ["Admin", "Super Admin"].includes(session?.user?.role);
  const isSuperAdmin = session?.user?.role === "Super Admin";
  const { orders, orderData, isLoading, isCreating, handlePageChange, handlePageClick, summary, isSummaryLoading } = clientOrderStore;
  const { products } = productStore;
  const { errorFields } = commonStore;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isRejectionOpen, onOpen: onRejectionOpen, onOpenChange: onRejectionOpenChange } = useDisclosure();
  const [deletingId, setDeletingId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingRejection, setPendingRejection] = useState({ orderId: null, reason: "" });
  const [activeTab, setActiveTab] = useState("orders");

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
            if (key === "summary") clientOrderStore.loadSummary();
          }}
          classNames={{ tabList: "mb-4" }}>

          {/* ТАБ 1: Списък */}
          <Tab key="orders" title="Заявки">
            <div className="flex flex-col sm:flex-row justify-center sm:justify-end items-center gap-2 mb-4">
              <button
                onClick={async () => {
                  setIsRefreshing(true);
                  await clientOrderStore.loadOrders();
                  setIsRefreshing(false);
                }}
                className="flex items-center justify-center gap-2 w-full sm:w-auto text-white bg-[#0071f5] hover:bg-blue-600 focus:outline-none font-semibold rounded-full text-sm px-1.5 sm:px-4 2xl:px-6 py-3 sm:py-1.5 2xl:py-2.5 text-center transition-all active:scale-90">
                <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>Презареди</span>
              </button>

              {(isAdmin || session?.user?.role === "Seller") && (
                <button
                  onClick={onOpen}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto text-white bg-[#0071f5] hover:bg-blue-600 focus:outline-none font-semibold rounded-full text-sm px-1.5 sm:px-4 2xl:px-6 py-3 sm:py-1.5 2xl:py-2.5 text-center transition-all active:scale-90">
                  <FiPlus className="w-4 h-4" />
                  <span>Добави</span>
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-slate-400">Зареждане...</div>
            ) : orders?.items?.length === 0 ? (
              <div className="p-8 text-center text-slate-400">Няма поръчки</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {orders?.items?.map((order) => (
                  <div key={order._id} className="bg-white rounded-xl shadow-sm flex flex-col relative">

                    <Link href={`/dashboard/client-orders/${order._id}`} className="p-4 flex flex-col gap-3 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-slate-800 text-base">{order.phone}</span>
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded w-fit ${order.isNewClient ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {order.isNewClient ? "Нов клиент" : "Съществуващ"}
                          </span>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1.5 rounded-lg shrink-0 ${STATUS_STYLES[order.status]}`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 font-medium">{order.product?.name ?? "—"}</span>
                        <div className="flex items-center gap-3 text-slate-500">
                          <span>{order.quantity} бр.</span>
                          <span className="font-semibold text-slate-700">{formatCurrency(order.price, 2)}</span>
                        </div>
                      </div>

                      {(order.address || order.note || order.assignedTo?.name) && (
                        <div className="flex flex-col gap-1 text-xs text-slate-400 border-t border-gray-100 pt-2">
                          {order.address && <span>📍 {order.address}</span>}
                          {order.note && <span>📝 {order.note}</span>}
                          {order.assignedTo?.name && (
                            <div className="flex items-center justify-between">
                              <span>👤 {order.assignedTo.name}</span>
                              {isSuperAdmin && (
                                <span className={`flex items-center gap-1 font-semibold ${order.viewedBySeller ? "text-green-500" : "text-gray-400"}`}>
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
                      <div className="flex items-center justify-between px-4 pb-3 gap-2">
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
                        <button
                          onClick={() => handleDelete(order._id)}
                          disabled={deletingId === order._id}
                          className="text-red-400 hover:text-red-600 transition-colors p-1">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
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
            {isSummaryLoading ? (
              <div className="p-8 text-center text-slate-400">Зареждане...</div>
            ) : summary?.bySeller ? (
              /* Super Admin — разбито по доставчици */
              !summary?.sellers?.length ? (
                <div className="p-8 text-center text-slate-400">Няма доставени поръчки</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {summary.sellers.map((seller) => (
                    <div key={seller._id ?? "unassigned"} className="bg-white rounded-xl shadow-sm overflow-hidden">
                      {/* Хедър на доставчик */}
                      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-gray-200">
                        <span className="text-sm font-bold text-slate-800">👤 {seller.sellerName}</span>
                        <span className="text-sm font-semibold text-[#0071f5]">{formatCurrency(seller.sellerTotal, 2)}</span>
                      </div>

                      {/* Колони */}
                      <div className="grid grid-cols-3 px-4 py-2 border-b border-gray-100 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        <span>Продукт</span>
                        <span className="text-center">Бройки</span>
                        <span className="text-right">Оборот</span>
                      </div>

                      {/* Редове */}
                      {seller.items
                        .slice()
                        .sort((a, b) => b.totalRevenue - a.totalRevenue)
                        .map((item, i) => (
                          <div key={i} className="grid grid-cols-3 px-4 py-3 border-b border-gray-50 items-center hover:bg-slate-50 transition-colors">
                            <span className="text-sm font-medium text-slate-700">{productTitle(item.product)}</span>
                            <span className="text-sm text-slate-500 text-center">{item.totalQuantity} бр.</span>
                            <span className="text-sm font-semibold text-slate-700 text-right">{formatCurrency(item.totalRevenue, 2)}</span>
                          </div>
                        ))}

                      {/* Общо за доставчика */}
                      <div className="grid grid-cols-3 px-4 py-3 bg-slate-50 border-t border-gray-200 items-center">
                        <span className="text-sm font-bold text-slate-700">Общо</span>
                        <span />
                        <span className="text-sm font-bold text-[#0071f5] text-right">{formatCurrency(seller.sellerTotal, 2)}</span>
                      </div>
                    </div>
                  ))}

                  {/* Общ оборот */}
                  <div className="bg-white rounded-xl shadow-sm px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800">Общ оборот</span>
                    <span className="text-base font-bold text-[#0071f5]">{formatCurrency(summary.grandTotal, 2)}</span>
                  </div>
                </div>
              )
            ) : (
              /* Seller — само неговите */
              !summary?.items?.length ? (
                <div className="p-8 text-center text-slate-400">Няма доставени поръчки</div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="grid grid-cols-3 px-4 py-2.5 bg-slate-50 border-b border-gray-100 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    <span>Продукт</span>
                    <span className="text-center">Бройки</span>
                    <span className="text-right">Оборот</span>
                  </div>

                  {summary.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-3 px-4 py-3 border-b border-gray-50 last:border-0 items-center hover:bg-slate-50 transition-colors">
                      <span className="text-sm font-medium text-slate-700">{productTitle(item.product)}</span>
                      <span className="text-sm text-slate-500 text-center">{item.totalQuantity} бр.</span>
                      <span className="text-sm font-semibold text-slate-700 text-right">{formatCurrency(item.totalRevenue, 2)}</span>
                    </div>
                  ))}

                  <div className="grid grid-cols-3 px-4 py-3 bg-slate-50 border-t border-gray-200 items-center">
                    <span className="text-sm font-bold text-slate-800">Общо</span>
                    <span />
                    <span className="text-sm font-bold text-[#0071f5] text-right">{formatCurrency(summary.grandTotal, 2)}</span>
                  </div>
                </div>
              )
            )}
          </Tab>
        </Tabs>
      </div>

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
