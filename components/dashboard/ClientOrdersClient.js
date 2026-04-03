"use client";
import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { useSession } from "next-auth/react";
import { Tabs, Tab, useDisclosure } from "@heroui/react";
import { FiPackage, FiBarChart2, FiClock, FiLayers, FiUsers } from "react-icons/fi";
import Layout from "@/components/layout/Dashboard";
import LinearLoader from "@/components/LinearLoader";
import { clientOrderStore } from "@/stores/useStore";
import { usePusherClientOrders } from "./ClientOrders/usePusherClientOrders";
import { useSummaryFilter } from "./ClientOrders/useSummaryFilter";
import CreateOrderModal from "./ClientOrders/CreateOrderModal";
import PayoutModal from "./ClientOrders/PayoutModal";
import RejectionModal from "./ClientOrders/RejectionModal";
import ClientOrdersOrdersTab from "@/components/dashboard/ClientOrdersOrdersTab";
import ClientOrdersSummaryTab from "@/components/dashboard/ClientOrdersSummaryTab";
import ClientOrdersHistoryTab from "@/components/dashboard/ClientOrdersHistoryTab";
import ClientOrdersStockTab from "@/components/dashboard/ClientOrders/ClientOrdersStockTab";
import ClientOrdersClientsTab from "@/components/dashboard/ClientOrders/ClientOrdersClientsTab";

const ClientOrdersClient = ({ initialData, sellers = [] }) => {
  const { data: session } = useSession();
  const sessionRef = useRef(session);
  useEffect(() => { sessionRef.current = session; }, [session]);

  const isAdmin = ["Admin", "Super Admin"].includes(session?.user?.role);
  const isSuperAdmin = session?.user?.role === "Super Admin";

  const { orders, isLoading, handlePageChange, handlePageClick, summary, isSummaryLoading, history, isHistoryLoading } = clientOrderStore;

  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateOpenChange } = useDisclosure();
  const { isOpen: isRejectionOpen, onOpen: onRejectionOpen, onOpenChange: onRejectionOpenChange } = useDisclosure();
  const { isOpen: isPayoutOpen, onOpen: onPayoutOpen, onOpenChange: onPayoutOpenChange } = useDisclosure();

  const [deletingId, setDeletingId] = useState(null);
  const [pendingRejectionOrderId, setPendingRejectionOrderId] = useState(null);
  const [pendingPayout, setPendingPayout] = useState(null);
  const [activeTab, setActiveTab] = useState("orders");

  const { summaryPreset, setSummaryPreset, customFrom, setCustomFrom, customTo, setCustomTo, applyFilter } = useSummaryFilter();

  usePusherClientOrders(initialData, sessionRef);

  const handleDelete = async (id) => {
    setDeletingId(id);
    await clientOrderStore.deleteOrder(id);
    setDeletingId(null);
  };

  const handleRejectionTrigger = (orderId) => {
    setPendingRejectionOrderId(orderId);
    onRejectionOpen();
  };

  const handlePayoutTrigger = (payout) => {
    setPendingPayout(payout);
    onPayoutOpen();
  };

  const showHistory = isSuperAdmin || session?.user?.role === "Seller";

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === "summary") applyFilter(summaryPreset);
    if (key === "history") clientOrderStore.loadHistory();
    if (key === "stock") clientOrderStore.loadStock();
  };

  const mobileTabs = [
    { key: "orders", label: "Заявки", Icon: FiPackage },
    { key: "summary", label: "Обобщение", Icon: FiBarChart2 },
    ...(showHistory ? [{ key: "history", label: "История", Icon: FiClock }] : []),
    { key: "stock", label: "Наличности", Icon: FiLayers },
    ...(isSuperAdmin ? [{ key: "clients", label: "Клиенти", Icon: FiUsers }] : []),
  ];

  return (
    <Layout title="Заявки">
      <LinearLoader show={isLoading} />
      <div className="min-h-screen 2xl:px-10">

        {/* Desktop tabs — скрити на мобилен */}
        <div className="hidden sm:block">
          <Tabs
            aria-label="Заявки табове"
            selectedKey={activeTab}
            onSelectionChange={handleTabChange}
            classNames={{ tabList: "mb-4" }}>
            <Tab key="orders" title="Заявки" />
            <Tab key="summary" title="Обобщение" />
            {showHistory && <Tab key="history" title="История" />}
            <Tab key="stock" title="Наличности" />
            {isSuperAdmin && <Tab key="clients" title="Клиенти" />}
          </Tabs>
        </div>

        {/* Съдържание */}
        <div className="pb-20 sm:pb-0">
          {activeTab === "orders" && (
            <ClientOrdersOrdersTab
              orders={orders}
              isLoading={isLoading}
              isAdmin={isAdmin}
              isSuperAdmin={isSuperAdmin}
              session={session}
              onOpen={onCreateOpen}
              deletingId={deletingId}
              handleDelete={handleDelete}
              onRejectionTrigger={handleRejectionTrigger}
              handlePageChange={handlePageChange}
              handlePageClick={handlePageClick}
            />
          )}
          {activeTab === "summary" && (
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
              onPayoutTrigger={handlePayoutTrigger}
            />
          )}
          {activeTab === "history" && showHistory && (
            <ClientOrdersHistoryTab
              history={history}
              isHistoryLoading={isHistoryLoading}
              isSuperAdmin={isSuperAdmin}
            />
          )}
          {activeTab === "stock" && (
            <ClientOrdersStockTab isSuperAdmin={isSuperAdmin} />
          )}
          {activeTab === "clients" && isSuperAdmin && (
            <ClientOrdersClientsTab />
          )}
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center px-2 pb-safe pt-1 pb-3">
          {mobileTabs.map(({ key, label, Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className="flex-1 flex flex-col items-center gap-1 py-1 transition-all">
                <div className={`flex items-center justify-center w-14 h-8 rounded-2xl transition-all duration-200 ${isActive ? "bg-[#0071f5]/10" : ""}`}>
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-[#0071f5]" : "text-slate-400"}`} />
                </div>
                <span className={`text-[11px] font-semibold transition-colors ${isActive ? "text-[#0071f5]" : "text-slate-400"}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <CreateOrderModal isOpen={isCreateOpen} onOpenChange={onCreateOpenChange} sellers={sellers} isSuperAdmin={isSuperAdmin} />
      <PayoutModal isOpen={isPayoutOpen} onOpenChange={onPayoutOpenChange} pendingPayout={pendingPayout} />
      <RejectionModal isOpen={isRejectionOpen} onOpenChange={onRejectionOpenChange} orderId={pendingRejectionOrderId} />
    </Layout>
  );
};

export default observer(ClientOrdersClient);
