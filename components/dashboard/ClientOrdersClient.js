"use client";
import React, { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useSession } from "next-auth/react";
import Layout from "@/components/layout/Dashboard";
import Modal from "@/components/Modal";
import Pagination from "@/components/table/Pagination";
import ClientOrderForm from "@/components/forms/ClientOrder";
import { useDisclosure } from "@heroui/react";
import Link from "next/link";
import { FiPlus, FiTrash2, FiRefreshCw } from "react-icons/fi";
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
  const { orders, orderData, isLoading, isCreating, handlePageChange, handlePageClick } = clientOrderStore;
  const { products } = productStore;
  const { errorFields } = commonStore;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [deletingId, setDeletingId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    <Layout title="Клиентски поръчки">
      <div className="min-h-screen 2xl:px-10">
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

          {isAdmin && (
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

                {/* Цялата кутия е линк */}
                <Link href={`/dashboard/client-orders/${order._id}`} className="p-4 flex flex-col gap-3 flex-1">
                  {/* Телефон + badge */}
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

                  {/* Продукт + бройки + цена */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium">{order.product?.name ?? "—"}</span>
                    <div className="flex items-center gap-3 text-slate-500">
                      <span>{order.quantity} бр.</span>
                      <span className="font-semibold text-slate-700">{formatCurrency(order.price, 2)}</span>
                    </div>
                  </div>

                  {/* Адрес / Бележка / Продавач */}
                  {(order.address || order.note || order.assignedTo?.name) && (
                    <div className="flex flex-col gap-1 text-xs text-slate-400 border-t border-gray-100 pt-2">
                      {order.address && <span>📍 {order.address}</span>}
                      {order.note && <span>📝 {order.note}</span>}
                      {order.assignedTo?.name && <span>👤 {order.assignedTo.name}</span>}
                    </div>
                  )}
                </Link>

                {/* Статус + изтрий (само за admin) */}
                {isAdmin && (
                  <div className="flex items-center justify-between px-4 pb-3 gap-2">
                    <Select
                      controlled
                      value={order.status}
                      items={STATUSES.map((s) => ({ _id: s, value: s, name: s }))}
                      onChange={(val) => clientOrderStore.updateStatus(order._id, val)}
                      classes={`text-xs font-semibold rounded-lg cursor-pointer w-auto min-w-0 ${STATUS_STYLES[order.status]}`}
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
    </Layout>
  );
};

export default observer(ClientOrdersClient);
