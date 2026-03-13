"use client";
import React, { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useSession } from "next-auth/react";
import Layout from "@/components/layout/Dashboard";
import Modal from "@/components/Modal";
import Pagination from "@/components/table/Pagination";
import ClientOrderForm from "@/components/forms/ClientOrder";
import { useDisclosure } from "@heroui/react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { productTitle, formatCurrency } from "@/utils";
import { clientOrderStore, commonStore, productStore } from "@/stores/useStore";

const STATUSES = ["нова", "изпратена", "доставена", "отказана"];

const STATUS_STYLES = {
  нова: "bg-blue-100 text-blue-700",
  изпратена: "bg-yellow-100 text-yellow-700",
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
      {isAdmin && (
        <button
          onClick={onOpen}
          className="text-white absolute -top-[3.3rem] sm:-top-[3.1rem] right-7 sm:right-18 2xl:right-96 bg-[#0071f5] hover:bg-blue-600 focus:outline-none font-semibold rounded-full text-sm px-1.5 sm:px-4 py-1.5 text-center transition-all active:scale-90">
          <span className="hidden sm:block">Добави</span>
          <FiPlus className="w-5 h-5 sm:hidden" />
        </button>
      )}

      <div className="min-h-screen 2xl:px-10">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 font-semibold text-slate-700">
            Поръчки
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-slate-400">Зареждане...</div>
          ) : orders?.items?.length === 0 ? (
            <div className="p-8 text-center text-slate-400">Няма поръчки</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">Клиент</th>
                    <th className="px-4 py-3">Продукт</th>
                    <th className="px-4 py-3">Бр.</th>
                    <th className="px-4 py-3">Цена</th>
                    <th className="px-4 py-3">Адрес</th>
                    <th className="px-4 py-3">Бележка</th>
                    <th className="px-4 py-3">Статус</th>
                    <th className="px-4 py-3">Продавач</th>
                    {isAdmin && <th className="px-4 py-3"></th>}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {orders?.items?.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-700">{order.phone}</div>
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${order.isNewClient ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {order.isNewClient ? "Нов" : "Съществуващ"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {order.product?.name ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{order.quantity}</td>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {formatCurrency(order.price, 2)}
                      </td>
                      <td className="px-4 py-3 text-slate-500 max-w-[150px] truncate">
                        {order.address || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-500 max-w-[150px] truncate">
                        {order.note || "-"}
                      </td>
                      <td className="px-4 py-3">
                        {isAdmin ? (
                          <select
                            value={order.status}
                            onChange={(e) => clientOrderStore.updateStatus(order._id, e.target.value)}
                            className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer ${STATUS_STYLES[order.status]}`}>
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${STATUS_STYLES[order.status]}`}>
                            {order.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {order.assignedTo?.name ?? <span className="text-gray-300">—</span>}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDelete(order._id)}
                            disabled={deletingId === order._id}
                            className="text-red-400 hover:text-red-600 transition-colors">
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-4 border-t border-gray-100">
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
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="Добави клиентска поръчка"
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
