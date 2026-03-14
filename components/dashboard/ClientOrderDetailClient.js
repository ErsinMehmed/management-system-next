"use client";
import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout/Dashboard";
import { FiArrowLeft, FiPhone, FiCopy, FiCheck, FiEye, FiEyeOff } from "react-icons/fi";
import { FaViber, FaWhatsapp } from "react-icons/fa";
import { Tooltip, Button, useDisclosure } from "@heroui/react";
import { formatCurrency } from "@/utils";
import { clientOrderStore } from "@/stores/useStore";
import Select from "@/components/html/Select";
import Modal from "@/components/Modal";

const STATUSES = ["нова", "доставена", "отказана"];

const STATUS_STYLES = {
  нова: "bg-blue-100 text-blue-700",
  доставена: "bg-green-100 text-green-700",
  отказана: "bg-red-100 text-red-700",
};

const Row = ({ label, value }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm font-medium text-slate-700 text-right max-w-[60%]">{value}</span>
  </div>
);

const ClientOrderDetailClient = ({ order }) => {
  const { data: session } = useSession();
  const isAdmin = ["Admin", "Super Admin"].includes(session?.user?.role);
  const isSuperAdmin = session?.user?.role === "Super Admin";
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [currentRejectionReason, setCurrentRejectionReason] = useState(order.rejectionReason || "");
  const [viewed, setViewed] = useState(order.viewedBySeller || false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (session?.user?.role === "Seller" && order.assignedTo?._id === session.user.id && !order.viewedBySeller) {
      clientOrderStore.markAsViewed(order._id).then(() => setViewed(true));
    }
  }, [session]);
  const { isOpen: isRejectionOpen, onOpen: onRejectionOpen, onOpenChange: onRejectionOpenChange } = useDisclosure();
  const [pendingReason, setPendingReason] = useState("");

  const handleCopy = () => {
    navigator.clipboard.writeText(order.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const phoneHref = order.contactMethod === "WhatsApp"
    ? `https://wa.me/${order.phone.replace(/\D/g, "")}`
    : order.contactMethod === "Viber"
    ? `viber://chat?number=${order.phone.replace(/\D/g, "")}`
    : `tel:${order.phone}`;

  const productName = order.product
    ? [order.product.name, order.product.flavor, order.product.weight && `${order.product.weight}г`, order.product.puffs && `${order.product.puffs}k`]
        .filter(Boolean).join(" ")
    : "—";

  return (
    <Layout title="Детайли на заявката">
      <div className="max-w-lg mx-auto 2xl:px-10">
        {/* Бек бутон */}
        <button
          onClick={() => router.push("/dashboard/client-orders")}
          className="flex items-center gap-2 mb-4 text-[#0071f5] font-semibold text-sm hover:text-blue-700 transition-colors">
          <FiArrowLeft className="w-4 h-4" />
          Назад към заявките
        </button>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">

          {/* Хедър */}
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <a
                  href={phoneHref}
                  onClick={() => navigator.clipboard.writeText(order.phone)}
                  className="flex items-center gap-2 text-xl font-bold text-[#0071f5] hover:text-blue-700 transition-colors">
                  <FiPhone className="w-5 h-5" />
                  {order.phone}
                </a>
                <Tooltip
                  content="Копирано"
                  color="default"
                  isOpen={copied}>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    onPress={handleCopy}>
                    {copied ? <FiCheck className="w-4 h-4 text-green-500" /> : <FiCopy className="w-4 h-4" />}
                  </Button>
                </Tooltip>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded w-fit ${order.isNewClient ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {order.isNewClient ? "Нов клиент" : "Съществуващ клиент"}
              </span>
            </div>
            <Select
              controlled
              value={currentStatus}
              disabled={["отказана", "доставена"].includes(currentStatus) && !isSuperAdmin}
              items={STATUSES.map((s) => ({ _id: s, value: s, name: s }))}
              onChange={async (val) => {
                if (val === "отказана") {
                  setPendingReason("");
                  onRejectionOpen();
                } else {
                  await clientOrderStore.updateStatus(order._id, val);
                  setCurrentStatus(val);
                  setCurrentRejectionReason("");
                }
              }}
              baseClass="w-36"
              classes={`text-xs font-semibold rounded-lg cursor-pointer w-auto min-w-0 ${STATUS_STYLES[currentStatus]} ${["отказана", "доставена"].includes(currentStatus) && !isSuperAdmin ? "opacity-60 pointer-events-none" : ""}`}
            />
          </div>

          {/* Детайли */}
          <div className="px-5 py-1">
            <Row label="Продукт" value={productName} />
            <Row label="Количество" value={`${order.quantity} бр.`} />
            <Row label="Цена" value={formatCurrency(order.price, 2)} />
            {order.contactMethod && (
              <Row
                label="Връзка"
                value={
                  <span className="flex items-center gap-1.5 justify-end">
                    {order.contactMethod === "Viber"
                      ? <FaViber className="w-4 h-4 text-[#7360F2]" />
                      : <FaWhatsapp className="w-4 h-4 text-[#25D366]" />}
                    {order.contactMethod}
                  </span>
                }
              />
            )}
            {order.address && <Row label="Адрес" value={order.address} />}
            {order.note && <Row label="Бележка" value={order.note} />}
            {currentRejectionReason && <Row label="Причина за отказ" value={currentRejectionReason} />}
            {order.assignedTo?.name && <Row label="Доставчик" value={order.assignedTo.name} />}
            {isSuperAdmin && order.assignedTo && (
              <Row
                label="Видяна от доставчик"
                value={
                  <span className={`flex items-center gap-1.5 justify-end text-xs font-semibold ${viewed ? "text-green-600" : "text-gray-400"}`}>
                    {viewed ? <FiEye className="w-3.5 h-3.5" /> : <FiEyeOff className="w-3.5 h-3.5" />}
                    {viewed ? "Да" : "Не"}
                  </span>
                }
              />
            )}
            <Row
              label="Дата"
              value={new Date(order.createdAt).toLocaleDateString("bg-BG", {
                day: "2-digit", month: "2-digit", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            />
          </div>
        </div>
      </div>
      <Modal
        isOpen={isRejectionOpen}
        onOpenChange={onRejectionOpenChange}
        title="Причина за отказ"
        primaryBtnText="Потвърди"
        onSave={async () => {
          await clientOrderStore.updateStatus(order._id, "отказана", pendingReason);
          setCurrentStatus("отказана");
          setCurrentRejectionReason(pendingReason);
          return true;
        }}>
        <textarea
          value={pendingReason}
          onChange={(e) => setPendingReason(e.target.value)}
          placeholder="Въведи причина за отказа..."
          rows={4}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </Modal>
    </Layout>
  );

};

export default observer(ClientOrderDetailClient);
