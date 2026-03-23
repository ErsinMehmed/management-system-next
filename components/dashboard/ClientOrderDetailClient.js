"use client";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { FiArrowLeft, FiCalendar } from "react-icons/fi";
import { toast } from "@heroui/react";
import PusherClient from "pusher-js";
import Layout from "@/components/layout/Dashboard";
import { clientOrderStore } from "@/stores/useStore";
import { clientOrderStatusConfig } from "@/data";
import { useOrderState } from "./ClientOrderDetail/useOrderState";
import OrderHeader from "./ClientOrderDetail/OrderHeader";
import OrderProductCard from "./ClientOrderDetail/OrderProductCard";
import OrderDetailsCard from "./ClientOrderDetail/OrderDetailsCard";
import EditOrderModal from "./ClientOrderDetail/EditOrderModal";
import RejectionModal from "./ClientOrderDetail/RejectionModal";

const ClientOrderDetailClient = ({ order }) => {
  const { data: session } = useSession();
  const sessionRef = useRef(session);
  useEffect(() => { sessionRef.current = session; }, [session]);

  const isSuperAdmin = session?.user?.role === "Super Admin";
  const router = useRouter();

  const {
    currentStatus, setCurrentStatus,
    currentRejectionReason, setCurrentRejectionReason,
    statusChangedAt, setStatusChangedAt,
    viewed, setViewed,
    productName, secondProductName,
    currentQuantity, setCurrentQuantity,
    currentPrice, setCurrentPrice,
    currentPayout, setCurrentPayout,
    setCurrentSecondProduct,
    setCurrentProductName,
    currentQuantity2, setCurrentQuantity2,
    currentPrice2, setCurrentPrice2,
    availableProducts,
  } = useOrderState(order);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const onEditOpen = () => setIsEditOpen(true);
  const onEditOpenChange = (open) => setIsEditOpen(open);
  const [isRejectionOpen, setIsRejectionOpen] = useState(false);
  const onRejectionOpen = () => setIsRejectionOpen(true);
  const onRejectionOpenChange = (open) => setIsRejectionOpen(open);

  const canEdit = currentStatus === "нова" || isSuperAdmin;
  const statusCfg = clientOrderStatusConfig[currentStatus] ?? clientOrderStatusConfig["нова"];

  // Mark as viewed for assigned seller — runs once when session resolves
  useEffect(() => {
    if (session?.user?.role === "Seller" && order.assignedTo?._id === session.user.id && !order.viewedBySeller) {
      clientOrderStore.markAsViewed(order._id).then(() => setViewed(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Pusher — real-time order updates
  useEffect(() => {
    const pusher = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });
    const channel = pusher.subscribe("client-orders");

    channel.bind("order-event", (event) => {
      const userId = sessionRef.current?.user?.id;
      const role = sessionRef.current?.user?.role;
      const isOwn = event.changedByUserId && String(event.changedByUserId) === String(userId);
      const isMine = role === "Seller" ? (event.assignedTo && String(event.assignedTo) === String(userId)) : true;

      if (event.type === "updated" && event.orderId === order._id) {
        router.refresh();
      }

      if (isOwn || !isMine) return;

      const num = event.orderNumber ? `#${event.orderNumber} ` : "";
      const by = event.changedBy ? ` от ${event.changedBy}` : "";

      if (event.type === "updated" && event.orderId === order._id) {
        if (event.change === "status") {
          const desc = { description: `${num}→ ${event.status}${by}`, timeout: 5000 };
          if (event.status === "доставена") toast.success("Статус обновен", desc);
          else if (event.status === "отказана") toast.danger("Статус обновен", desc);
          else toast("Статус обновен", desc);
        } else {
          toast("Заявка редактирана", { description: `${num}редактирана${by}`, timeout: 5000 });
        }
      } else if (event.type === "created") {
        toast.success("Нова заявка", { description: `${num}добавена${by}`, timeout: 5000 });
      } else if (event.type === "deleted" && event.orderId === order._id) {
        toast.danger("Заявка изтрита", { description: `${num}изтрита${by}`, timeout: 5000 });
      }
    });

    return () => {
      channel.unbind_all();
      pusher.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order._id]);

  const handleStatusChange = async (val) => {
    if (val === "отказана") {
      onRejectionOpen();
    } else {
      await clientOrderStore.updateStatus(order._id, val);
      setCurrentStatus(val);
      setCurrentRejectionReason("");
      setStatusChangedAt(["доставена", "отказана"].includes(val) ? new Date() : null);
    }
  };

  const handleEditSuccess = ({ productName: name, quantity, price, payout, secondProduct, quantity2, price2 }) => {
    if (name) setCurrentProductName(name);
    setCurrentQuantity(quantity);
    setCurrentPrice(price);
    if (isSuperAdmin && payout !== undefined) setCurrentPayout(payout);
    setCurrentSecondProduct(secondProduct);
    setCurrentQuantity2(quantity2);
    setCurrentPrice2(price2);
  };

  const handleRejectionSuccess = (reason) => {
    setCurrentStatus("отказана");
    setCurrentRejectionReason(reason);
    setStatusChangedAt(new Date());
  };

  return (
    <Layout title="Детайли на заявката">
      <div className="max-w-xl mx-auto 2xl:px-10">
        <Button
          variant="light"
          size="sm"
          startContent={<FiArrowLeft className="w-4 h-4" />}
          onPress={() => router.push("/dashboard/client-orders")}
          className="mb-5 text-slate-500 hover:text-[#0071f5] font-medium px-0">
          Назад
        </Button>

        <div className="flex flex-col gap-3">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className={`h-1.5 w-full ${statusCfg.accent}`} />
            <OrderHeader
              order={order}
              currentStatus={currentStatus}
              statusChangedAt={statusChangedAt}
              isSuperAdmin={isSuperAdmin}
              onStatusChange={handleStatusChange}
            />
            <OrderProductCard
              productName={productName}
              secondProductName={secondProductName}
              currentQuantity={currentQuantity}
              currentQuantity2={currentQuantity2}
              currentPrice={currentPrice}
              currentPrice2={currentPrice2}
              currentPayout={currentPayout}
              isSuperAdmin={isSuperAdmin}
              canEdit={canEdit}
              onEdit={onEditOpen}
            />
          </div>

          <OrderDetailsCard
            order={order}
            currentRejectionReason={currentRejectionReason}
            viewed={viewed}
            isSuperAdmin={isSuperAdmin}
          />

          <div className="bg-white rounded-2xl shadow-sm px-5 py-3.5 flex items-center gap-3">
            <FiCalendar className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Дата на заявката</p>
              <p className="text-sm font-medium text-slate-700">
                {new Date(order.createdAt).toLocaleDateString("bg-BG", {
                  day: "2-digit", month: "2-digit", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <EditOrderModal
        isOpen={isEditOpen}
        onOpenChange={onEditOpenChange}
        order={order}
        availableProducts={availableProducts}
        isSuperAdmin={isSuperAdmin}
        onSuccess={handleEditSuccess}
      />

      <RejectionModal
        isOpen={isRejectionOpen}
        onOpenChange={onRejectionOpenChange}
        orderId={order._id}
        onSuccess={handleRejectionSuccess}
      />
    </Layout>
  );
};

export default observer(ClientOrderDetailClient);
