"use client";
import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { Button } from "@heroui/react";
import { FiPlus, FiTrash2, FiEye, FiEyeOff, FiPhone, FiMapPin, FiFileText, FiUser, FiPackage, FiCheck, FiX, FiClock } from "react-icons/fi";
import moment from "moment";
import "moment/locale/bg";

moment.locale("bg");
import Pagination from "@/components/table/Pagination";
import Select from "@/components/html/Select";
import { productTitle, formatCurrency } from "@/utils";
import { clientOrderStore } from "@/stores/useStore";
import { clientOrderStatuses, clientOrderStatusConfig } from "@/data";

const SWIPE_THRESHOLD = 72;

const SwipeableCard = ({ children, onSwipeLeft, onSwipeRight, canSwipe, isSeller, deletingId }) => {
  const [dx, setDx] = useState(0);
  const [settling, setSettling] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const direction = useRef(null); // "h" | "v" | null

  const commit = (finalDx) => {
    setSettling(true);
    if (finalDx < -SWIPE_THRESHOLD && onSwipeLeft) {
      setDx(-SWIPE_THRESHOLD * 1.5);
      setTimeout(() => { onSwipeLeft(); setDx(0); setSettling(false); }, 200);
    } else if (finalDx > SWIPE_THRESHOLD && onSwipeRight) {
      setDx(0);
      setSettling(false);
      onSwipeRight();
    } else {
      setDx(0);
      setTimeout(() => setSettling(false), 250);
    }
  };

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    direction.current = null;
    setSettling(false);
  };

  const onTouchMove = (e) => {
    if (!canSwipe) return;
    const deltaX = e.touches[0].clientX - startX.current;
    const deltaY = e.touches[0].clientY - startY.current;

    if (direction.current === null) {
      if (Math.abs(deltaX) > Math.abs(deltaY) + 4) direction.current = "h";
      else if (Math.abs(deltaY) > Math.abs(deltaX) + 4) direction.current = "v";
      else return;
    }
    if (direction.current !== "h") return;

    e.preventDefault();
    const clamped = deltaX > 0
      ? Math.min(deltaX, SWIPE_THRESHOLD * 1.2)
      : Math.max(deltaX, -SWIPE_THRESHOLD * 1.8);
    setDx(clamped);
  };

  const onTouchEnd = () => {
    if (direction.current !== "h") return;
    commit(dx);
  };

  const leftReady = dx >= SWIPE_THRESHOLD;
  const rightReady = dx <= -SWIPE_THRESHOLD;

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}>

      {/* Swipe-right background */}
      {onSwipeRight && (
        <div className={`absolute inset-0 rounded-2xl flex items-center pl-5 transition-colors ${
          isSeller
            ? (leftReady ? "bg-green-500" : "bg-green-500/70")
            : (leftReady ? "bg-[#0071f5]" : "bg-[#0071f5]/70")
        }`}>
          <div className="flex flex-col items-center gap-1">
            <FiCheck className="w-5 h-5 text-white" />
            <span className="text-[10px] font-bold text-white">{isSeller ? "Доставена" : "Статус"}</span>
          </div>
        </div>
      )}

      {/* Swipe-left background */}
      {onSwipeLeft && (
        <div className={`absolute inset-0 rounded-2xl flex items-center justify-end pr-5 transition-colors ${rightReady ? "bg-red-500" : "bg-red-400/80"}`}>
          <div className="flex flex-col items-center gap-1">
            {isSeller ? (
              <FiX className="w-5 h-5 text-white" />
            ) : deletingId ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <FiTrash2 className="w-5 h-5 text-white" />
            )}
            <span className="text-[10px] font-bold text-white">{isSeller ? "Отказана" : "Изтрий"}</span>
          </div>
        </div>
      )}

      {/* Card — slides over backgrounds */}
      <div
        className={`relative ${settling ? "transition-transform duration-250 ease-out" : ""}`}
        style={{ transform: `translateX(${dx}px)` }}>
        {children}
      </div>
    </div>
  );
};

const ClientOrdersOrdersTab = ({
  orders, isLoading, isAdmin, isSuperAdmin, session,
  onOpen, deletingId, handleDelete,
  onRejectionTrigger,
  handlePageChange, handlePageClick,
}) => {
  const sentinelRef = useRef(null);
  const [statusPickerOrder, setStatusPickerOrder] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth >= 640) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) clientOrderStore.loadMoreOrders(); },
      { threshold: 0.1 }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
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
        {orders?.items?.map((order) => {
          const isLocked = ["отказана", "доставена"].includes(order.status) && !isSuperAdmin;
          const cardInner = (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col group hover:shadow-lg transition-shadow">
              <div className={`h-1 w-full ${clientOrderStatusConfig[order.status]?.accent ?? "bg-slate-300"}`} />

              <Link href={`/dashboard/client-orders/${order._id}`} className="px-4 pt-3.5 pb-3 flex flex-col gap-3 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-slate-100">
                      {(() => { const Icon = clientOrderStatusConfig[order.status]?.icon ?? FiPhone; return <Icon className="w-3.5 h-3.5 text-slate-400" />; })()}
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
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${clientOrderStatusConfig[order.status]?.badge}`}>
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
                <div className="flex items-center gap-1.5 text-xs text-slate-300 pt-1">
                  <FiClock className="w-3 h-3 shrink-0" />
                  <span>{moment(order.createdAt).format("DD.MM.YYYY HH:mm")}</span>
                </div>
              </Link>

              {/* Desktop admin footer — hidden on mobile (swipe handles it) */}
              {isAdmin && (
                <div className="hidden sm:flex items-center justify-between px-4 py-2.5 border-t border-gray-50 gap-2">
                  <Select
                    controlled
                    value={order.status}
                    disabled={isLocked}
                    items={clientOrderStatuses.map((s) => ({ _id: s, value: s, name: s }))}
                    onChange={(val) => {
                      if (val === "отказана") onRejectionTrigger(order._id);
                      else clientOrderStore.updateStatus(order._id, val);
                    }}
                    baseClass="w-36"
                    classes={`text-xs font-semibold rounded-lg cursor-pointer w-auto min-w-0 ${clientOrderStatusConfig[order.status]?.badge} ${isLocked ? "opacity-60 pointer-events-none" : ""}`}
                  />
                  <Button isIconOnly variant="light" color="danger" size="sm"
                    isLoading={deletingId === order._id}
                    onPress={() => handleDelete(order._id)}>
                    <FiTrash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          );

          // Mobile: wrap in swipeable, desktop: plain card
          const isSeller = session?.user?.role === "Seller";
          return (
            <div key={order._id}>
              <div className="sm:hidden">
                {isSeller ? (
                  <SwipeableCard
                    canSwipe={!isLocked}
                    isSeller
                    onSwipeRight={!isLocked ? () => clientOrderStore.updateStatus(order._id, "доставена") : null}
                    onSwipeLeft={!isLocked ? () => onRejectionTrigger(order._id) : null}>
                    {cardInner}
                  </SwipeableCard>
                ) : (
                  <SwipeableCard
                    canSwipe={isAdmin}
                    deletingId={deletingId === order._id}
                    onSwipeLeft={() => handleDelete(order._id)}
                    onSwipeRight={!isLocked ? () => setStatusPickerOrder(order) : null}>
                    {cardInner}
                  </SwipeableCard>
                )}
              </div>
              <div className="hidden sm:block">{cardInner}</div>
            </div>
          );
        })}
      </div>
    )}

    {/* Mobile status picker bottom sheet */}
    {statusPickerOrder && (
      <div className="sm:hidden fixed inset-0 z-50 flex items-end" onClick={() => setStatusPickerOrder(null)}>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        <div className="relative w-full bg-white rounded-t-3xl px-4 pt-4 flex flex-col gap-3 overflow-y-auto max-h-[80vh]" style={{ paddingBottom: "89px" }} onClick={(e) => e.stopPropagation()}>
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700 mb-1">Смени статус — <span className="text-[#0071f5]">{statusPickerOrder.phone}</span></p>
          {clientOrderStatuses.map((s) => {
            const cfg = clientOrderStatusConfig[s];
            const isActive = statusPickerOrder.status === s;
            const isDisabled = ["отказана", "доставена"].includes(statusPickerOrder.status) && !isSuperAdmin;
            return (
              <button
                key={s}
                disabled={isDisabled}
                onClick={() => {
                  if (s === "отказана") { onRejectionTrigger(statusPickerOrder._id); }
                  else { clientOrderStore.updateStatus(statusPickerOrder._id, s); }
                  setStatusPickerOrder(null);
                }}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold text-sm transition-colors border
                  ${isActive ? `${cfg?.badge} border-current/30 ring-2 ring-offset-1 ring-current` : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"}
                  ${isDisabled ? "opacity-40 pointer-events-none" : ""}`}>
                {cfg?.icon && <cfg.icon className="w-4 h-4 shrink-0" />}
                {s}
                {isActive && <FiCheck className="w-4 h-4 ml-auto" />}
              </button>
            );
          })}
        </div>
      </div>
    )}

    {/* Desktop pagination */}
    <div className="hidden sm:block mt-4">
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

    {/* Mobile infinite scroll sentinel */}
    <div ref={sentinelRef} className="sm:hidden mt-4 flex justify-center h-8">
      {clientOrderStore.isLoadingMore && (
        <div className="w-6 h-6 rounded-full border-2 border-[#0071f5] border-t-transparent animate-spin" />
      )}
    </div>
  </>
  );
};

export default observer(ClientOrdersOrdersTab);
