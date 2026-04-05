"use client";
import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { useSession } from "next-auth/react";
import { Tabs } from "@heroui/react";
import { useDisclosure } from "@/hooks/useDisclosure";
import {
  FiPackage,
  FiBarChart2,
  FiClock,
  FiLayers,
  FiUsers,
} from "react-icons/fi";
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
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const isAdmin = ["Admin", "Super Admin"].includes(session?.user?.role);
  const isSuperAdmin = session?.user?.role === "Super Admin";

  const {
    orders,
    isLoading,
    handlePageChange,
    handlePageClick,
    summary,
    isSummaryLoading,
    history,
    isHistoryLoading,
  } = clientOrderStore;

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onOpenChange: onCreateOpenChange,
  } = useDisclosure();
  const {
    isOpen: isRejectionOpen,
    onOpen: onRejectionOpen,
    onOpenChange: onRejectionOpenChange,
  } = useDisclosure();
  const {
    isOpen: isPayoutOpen,
    onOpen: onPayoutOpen,
    onOpenChange: onPayoutOpenChange,
  } = useDisclosure();

  const [deletingId, setDeletingId] = useState(null);
  const [pendingRejectionOrderId, setPendingRejectionOrderId] = useState(null);
  const [pendingPayout, setPendingPayout] = useState(null);
  const [activeTab, setActiveTab] = useState("orders");

  const {
    summaryPreset,
    setSummaryPreset,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    applyFilter,
  } = useSummaryFilter();

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
    ...(showHistory
      ? [{ key: "history", label: "История", Icon: FiClock }]
      : []),
    { key: "stock", label: "Наличности", Icon: FiLayers },
    ...(isSuperAdmin
      ? [{ key: "clients", label: "Клиенти", Icon: FiUsers }]
      : []),
  ];

  return (
    <Layout title='Заявки'>
      <LinearLoader show={isLoading} />
      <div className='min-h-screen 2xl:px-10'>
        {/* Desktop tabs — скрити на мобилен */}
        <div className='hidden sm:block mb-5'>
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={handleTabChange}>
            <Tabs.ListContainer>
              <Tabs.List aria-label='Заявки табове'>
                <Tabs.Tab id='orders'>
                  <Tabs.Indicator />
                  Заявки
                </Tabs.Tab>
                <Tabs.Tab id='summary'>
                  <Tabs.Separator />
                  <Tabs.Indicator />
                  Обобщение
                </Tabs.Tab>
                {showHistory && (
                  <Tabs.Tab id='history'>
                    <Tabs.Separator />
                    <Tabs.Indicator />
                    История
                  </Tabs.Tab>
                )}
                <Tabs.Tab id='stock'>
                  <Tabs.Separator />
                  <Tabs.Indicator />
                  Наличности
                </Tabs.Tab>
                {isSuperAdmin && (
                  <Tabs.Tab id='clients'>
                    <Tabs.Separator />
                    <Tabs.Indicator />
                    Клиенти
                  </Tabs.Tab>
                )}
              </Tabs.List>
            </Tabs.ListContainer>

            <Tabs.Panel id='orders' className='pb-20 sm:pb-0'>
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
            </Tabs.Panel>
            <Tabs.Panel id='summary' className='pb-20 sm:pb-0'>
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
            </Tabs.Panel>
            {showHistory && (
              <Tabs.Panel id='history' className='pb-20 sm:pb-0'>
                <ClientOrdersHistoryTab
                  history={history}
                  isHistoryLoading={isHistoryLoading}
                  isSuperAdmin={isSuperAdmin}
                />
              </Tabs.Panel>
            )}
            <Tabs.Panel id='stock' className='pb-20 sm:pb-0'>
              <ClientOrdersStockTab isSuperAdmin={isSuperAdmin} />
            </Tabs.Panel>
            {isSuperAdmin && (
              <Tabs.Panel id='clients' className='pb-20 sm:pb-0'>
                <ClientOrdersClientsTab />
              </Tabs.Panel>
            )}
          </Tabs>
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className='sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]'>
        <div className='flex items-center px-2 pb-safe pt-1 pb-3'>
          {mobileTabs.map(({ key, label, Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className='flex-1 flex flex-col items-center gap-1 py-1 transition-all'>
                <div
                  className={`flex items-center justify-center w-14 h-8 rounded-2xl transition-all duration-200 ${isActive ? "bg-[#0071f5]/10" : ""}`}>
                  <Icon
                    className={`w-5 h-5 transition-colors ${isActive ? "text-[#0071f5]" : "text-slate-400"}`}
                  />
                </div>
                <span
                  className={`text-[11px] font-semibold transition-colors ${isActive ? "text-[#0071f5]" : "text-slate-400"}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <CreateOrderModal
        isOpen={isCreateOpen}
        onOpenChange={onCreateOpenChange}
        sellers={sellers}
        isSuperAdmin={isSuperAdmin}
      />
      <PayoutModal
        isOpen={isPayoutOpen}
        onOpenChange={onPayoutOpenChange}
        pendingPayout={pendingPayout}
      />
      <RejectionModal
        isOpen={isRejectionOpen}
        onOpenChange={onRejectionOpenChange}
        orderId={pendingRejectionOrderId}
      />
    </Layout>
  );
};

export default observer(ClientOrdersClient);
