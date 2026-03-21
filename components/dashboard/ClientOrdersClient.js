"use client";
import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { useSession } from "next-auth/react";
import { Tabs, Tab, useDisclosure } from "@heroui/react";
import Layout from "@/components/layout/Dashboard";
import { clientOrderStore } from "@/stores/useStore";
import { usePusherClientOrders } from "./ClientOrders/usePusherClientOrders";
import { useSummaryFilter } from "./ClientOrders/useSummaryFilter";
import CreateOrderModal from "./ClientOrders/CreateOrderModal";
import PayoutModal from "./ClientOrders/PayoutModal";
import RejectionModal from "./ClientOrders/RejectionModal";
import ClientOrdersOrdersTab from "@/components/dashboard/ClientOrdersOrdersTab";
import ClientOrdersSummaryTab from "@/components/dashboard/ClientOrdersSummaryTab";
import ClientOrdersHistoryTab from "@/components/dashboard/ClientOrdersHistoryTab";

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
              onOpen={onCreateOpen}
              deletingId={deletingId}
              handleDelete={handleDelete}
              onRejectionTrigger={handleRejectionTrigger}
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
              onPayoutTrigger={handlePayoutTrigger}
            />
          </Tab>

          {(isSuperAdmin || session?.user?.role === "Seller") && (
            <Tab key="history" title="История">
              <ClientOrdersHistoryTab
                history={history}
                isHistoryLoading={isHistoryLoading}
                isSuperAdmin={isSuperAdmin}
              />
            </Tab>
          )}
        </Tabs>
      </div>

      <CreateOrderModal isOpen={isCreateOpen} onOpenChange={onCreateOpenChange} sellers={sellers} />
      <PayoutModal isOpen={isPayoutOpen} onOpenChange={onPayoutOpenChange} pendingPayout={pendingPayout} />
      <RejectionModal isOpen={isRejectionOpen} onOpenChange={onRejectionOpenChange} orderId={pendingRejectionOrderId} />
    </Layout>
  );
};

export default observer(ClientOrdersClient);
