"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { useSession } from "next-auth/react";
import Layout from "@/components/layout/Dashboard";
import Modal from "@/components/Modal";
import ClientOrderForm from "@/components/forms/ClientOrder";
import { useDisclosure, Tabs, Tab } from "@heroui/react";
import { getLocalTimeZone } from "@internationalized/date";
import { productTitle, formatCurrency } from "@/utils";
import { clientOrderStore, commonStore, productStore } from "@/stores/useStore";
import { addToast } from "@heroui/toast";
import PusherClient from "pusher-js";
import ClientOrdersOrdersTab from "@/components/dashboard/ClientOrdersOrdersTab";
import ClientOrdersSummaryTab from "@/components/dashboard/ClientOrdersSummaryTab";
import ClientOrdersHistoryTab from "@/components/dashboard/ClientOrdersHistoryTab";

function shouldShowToast(event, userId, role) {
  if (event.changedByUserId && String(event.changedByUserId) === String(userId)) return false;
  if (role === "Seller") return event.assignedTo && String(event.assignedTo) === String(userId);
  return true;
}

function showOrderToast(event) {
  const num = event.orderNumber ? `#${event.orderNumber} ` : "";
  const by = event.changedBy ? ` от ${event.changedBy}` : "";
  if (event.type === "created") {
    addToast({ title: "Нова заявка", description: `${num}добавена${by}`, color: "success", timeout: 5000 });
  } else if (event.type === "updated" && event.change === "status") {
    const color = event.status === "доставена" ? "success" : event.status === "отказана" ? "danger" : "primary";
    addToast({ title: "Статус обновен", description: `${num}→ ${event.status}${by}`, color, timeout: 5000 });
  } else if (event.type === "updated") {
    addToast({ title: "Заявка редактирана", description: `${num}редактирана${by}`, color: "default", timeout: 5000 });
  } else if (event.type === "deleted") {
    addToast({ title: "Заявка изтрита", description: `${num}изтрита${by}`, color: "danger", timeout: 5000 });
  }
}

const ClientOrdersClient = ({ initialData, sellers = [] }) => {
  const { data: session } = useSession();
  const sessionRef = useRef(session);
  useEffect(() => { sessionRef.current = session; }, [session]);
  const isAdmin = ["Admin", "Super Admin"].includes(session?.user?.role);
  const isSuperAdmin = session?.user?.role === "Super Admin";
  const { orders, orderData, isLoading, isCreating, handlePageChange, handlePageClick, summary, isSummaryLoading, history, isHistoryLoading } = clientOrderStore;
  const { products } = productStore;
  const { errorFields } = commonStore;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isRejectionOpen, onOpen: onRejectionOpen, onOpenChange: onRejectionOpenChange } = useDisclosure();
  const { isOpen: isPayoutOpen, onOpen: onPayoutOpen, onOpenChange: onPayoutOpenChange } = useDisclosure();
  const [deletingId, setDeletingId] = useState(null);
  const [pendingRejection, setPendingRejection] = useState({ orderId: null, reason: "" });
  const [pendingPayout, setPendingPayout] = useState(null);
  const [isPayingOut, setIsPayingOut] = useState(false);
  const [activeTab, setActiveTab] = useState("orders");
  const [summaryPreset, setSummaryPreset] = useState("24h");
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);
  const [visiblePayments, setVisiblePayments] = useState({});
  const PAYMENTS_PAGE = 8;
  const getVisibleCount = (si) => visiblePayments[si] ?? PAYMENTS_PAGE;
  const loadMorePayments = (si) => setVisiblePayments((prev) => ({ ...prev, [si]: (prev[si] ?? PAYMENTS_PAGE) + PAYMENTS_PAGE }));

  useEffect(() => {
    if (initialData) {
      clientOrderStore.hydrateOrders(initialData.orders);
    } else {
      clientOrderStore.loadOrders();
    }

    const pusher = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });
    const channel = pusher.subscribe("client-orders");
    channel.bind("order-event", (event) => {
      clientOrderStore.loadOrders();
      if (shouldShowToast(event, sessionRef.current?.user?.id, sessionRef.current?.user?.role)) {
        showOrderToast(event);
      }
    });
    return () => {
      channel.unbind_all();
      pusher.disconnect();
    };
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
    } else if (name === "product2") {
      const selected = updatedProducts.find((p) => p._id === value);
      const qty = Number(orderData.quantity2);
      const autoPrice2 = selected?.sell_prices?.[qty - 1] ?? "";
      clientOrderStore.setOrderData({ ...orderData, product2: value, price2: autoPrice2 });
    } else if (name === "quantity2") {
      const qty = Number(value);
      const selected = updatedProducts.find((p) => p._id === orderData.product2);
      const autoPrice2 = selected?.sell_prices?.[qty - 1] ?? "";
      clientOrderStore.setOrderData({ ...orderData, quantity2: value, price2: autoPrice2 });
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
      case "custom": {
        return { from: cfrom ? cfrom.toDate(getLocalTimeZone()).toISOString() : null, to: cto ? cto.toDate(getLocalTimeZone()).toISOString() : null };
      }
      default: return { from: null, to: null };
    }
  };

  const applyFilter = (preset, cfrom = customFrom, cto = customTo) => {
    const { from, to } = computeRange(preset, cfrom, cto);
    clientOrderStore.loadSummary(from, to);
  };

  const handleCreate = async () => await clientOrderStore.createOrder();

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

          <Tab key="orders" title="Заявки">
            <ClientOrdersOrdersTab
              orders={orders}
              isLoading={isLoading}
              isAdmin={isAdmin}
              isSuperAdmin={isSuperAdmin}
              session={session}
              onOpen={onOpen}
              deletingId={deletingId}
              handleDelete={handleDelete}
              setPendingRejection={setPendingRejection}
              onRejectionOpen={onRejectionOpen}
              handlePageChange={handlePageChange}
              handlePageClick={handlePageClick}
            />
          </Tab>

          <Tab key="summary" title="Обобщение">
            <ClientOrdersSummaryTab
              summary={summary}
              isSummaryLoading={isSummaryLoading}
              isSuperAdmin={isSuperAdmin}
              summaryPreset={summaryPreset}
              setSummaryPreset={setSummaryPreset}
              applyFilter={applyFilter}
              customFrom={customFrom}
              setCustomFrom={setCustomFrom}
              customTo={customTo}
              setCustomTo={setCustomTo}
              setPendingPayout={setPendingPayout}
              onPayoutOpen={onPayoutOpen}
            />
          </Tab>

          {(isSuperAdmin || session?.user?.role === "Seller") && (
            <Tab key="history" title="История">
              <ClientOrdersHistoryTab
                history={history}
                isHistoryLoading={isHistoryLoading}
                isSuperAdmin={isSuperAdmin}
                getVisibleCount={getVisibleCount}
                loadMorePayments={loadMorePayments}
              />
            </Tab>
          )}
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
