"use client";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout/Dashboard";
import { FiArrowLeft, FiPhone, FiCopy, FiCheck } from "react-icons/fi";
import { FaViber, FaWhatsapp } from "react-icons/fa";
import { Tooltip, Button } from "@heroui/react";
import { formatCurrency } from "@/utils";
import { clientOrderStore } from "@/stores/useStore";
import Select from "@/components/html/Select";

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
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(order.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
                  href={`tel:${order.phone}`}
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
              items={STATUSES.map((s) => ({ _id: s, value: s, name: s }))}
              onChange={async (val) => {
                await clientOrderStore.updateStatus(order._id, val);
                setCurrentStatus(val);
              }}
              baseClass="w-36"
              classes={`text-xs font-semibold rounded-lg cursor-pointer w-auto min-w-0 ${STATUS_STYLES[currentStatus]}`}
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
            {order.assignedTo?.name && <Row label="Доставчик" value={order.assignedTo.name} />}
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
    </Layout>
  );

};

export default observer(ClientOrderDetailClient);
