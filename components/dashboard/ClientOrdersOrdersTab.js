"use client";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { Button } from "@heroui/react";
import { FiPlus, FiTrash2, FiEye, FiEyeOff, FiPhone, FiMapPin, FiFileText, FiUser, FiPackage, FiXCircle, FiTruck } from "react-icons/fi";
import Pagination from "@/components/table/Pagination";
import Select from "@/components/html/Select";
import { productTitle, formatCurrency } from "@/utils";
import { clientOrderStore } from "@/stores/useStore";

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

const ClientOrdersOrdersTab = ({
  orders, isLoading, isAdmin, isSuperAdmin, session,
  onOpen, deletingId, handleDelete,
  setPendingRejection, onRejectionOpen,
  handlePageChange, handlePageClick,
}) => (
  <>
    <div className="flex flex-col sm:flex-row justify-center sm:justify-end items-center gap-2 mb-4">
      {(isAdmin || session?.user?.role === "Seller") && (
        <Button
          variant="solid"
          color="primary"
          radius="full"
          size="md"
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
            <div className={`h-1 w-full ${STATUS_ACCENT[order.status] ?? "bg-slate-300"}`} />

            <Link href={`/dashboard/client-orders/${order._id}`} className="px-4 pt-3.5 pb-3 flex flex-col gap-3 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-slate-100">
                    {(() => { const Icon = STATUS_ICON[order.status] ?? FiPhone; return <Icon className="w-3.5 h-3.5 text-slate-400" />; })()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-800 text-base leading-tight">{order.phone}</p>
                      {order.orderNumber > 0 && (
                        <span className="text-xs font-bold text-slate-400">#{order.orderNumber}</span>
                      )}
                    </div>
                    <span className={`text-xs font-semibold ${order.isNewClient ? "text-green-600" : "text-slate-400"}`}>
                      {order.isNewClient ? "✦ Нов клиент" : "Съществуващ"}
                    </span>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${STATUS_STYLES[order.status]}`}>
                  {order.status}
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl px-3 py-2.5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FiPackage className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-sm font-semibold text-slate-700 truncate">{order.product ? productTitle(order.product) : "—"}</span>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-sm text-slate-400 tabular-nums">{order.quantity} бр.</span>
                    <span className="text-sm font-bold text-[#0071f5] tabular-nums">
                      {formatCurrency(order.price + (order.secondProduct?.price ?? 0), 2)}
                    </span>
                  </div>
                </div>
                {order.secondProduct?.product && (
                  <div className="flex items-center gap-2 min-w-0 pl-6">
                    <span className="text-[10px] font-bold text-slate-400">+</span>
                    <span className="text-xs font-medium text-slate-500 truncate">{productTitle(order.secondProduct.product)}</span>
                    <span className="text-xs text-slate-400 tabular-nums shrink-0">× {order.secondProduct.quantity} бр.</span>
                  </div>
                )}
              </div>

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
  </>
);

export default observer(ClientOrdersOrdersTab);
