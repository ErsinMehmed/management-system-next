"use client";
import { observer } from "mobx-react-lite";
import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout/Dashboard";
import { FiArrowLeft, FiPhone, FiCopy, FiCheck, FiEye, FiEyeOff, FiEdit2, FiMapPin, FiFileText, FiUser, FiClock, FiCalendar, FiAlertCircle, FiTruck } from "react-icons/fi";
import { FaViber, FaWhatsapp } from "react-icons/fa";
import { Tooltip, Button, useDisclosure } from "@heroui/react";
import { formatCurrency } from "@/utils";
import { clientOrderStore, productStore } from "@/stores/useStore";
import { productTitle } from "@/utils";
import Select from "@/components/html/Select";
import Modal from "@/components/Modal";

const STATUSES = ["нова", "доставена", "отказана"];

const STATUS_CONFIG = {
  нова:     { badge: "bg-blue-100 text-blue-700",   accent: "bg-blue-500" },
  доставена:{ badge: "bg-green-100 text-green-700", accent: "bg-green-500" },
  отказана: { badge: "bg-red-100 text-red-700",     accent: "bg-red-500" },
};

const ClientOrderDetailClient = ({ order }) => {
  const { data: session } = useSession();
  const isAdmin = ["Admin", "Super Admin"].includes(session?.user?.role);
  const isSuperAdmin = session?.user?.role === "Super Admin";
  const router = useRouter();

  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [currentRejectionReason, setCurrentRejectionReason] = useState(order.rejectionReason || "");
  const [statusChangedAt, setStatusChangedAt] = useState(order.statusChangedAt || null);
  const [viewed, setViewed] = useState(order.viewedBySeller || false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (session?.user?.role === "Seller" && order.assignedTo?._id === session.user.id && !order.viewedBySeller) {
      clientOrderStore.markAsViewed(order._id).then(() => setViewed(true));
    }
  }, [session]);

  const { isOpen: isRejectionOpen, onOpen: onRejectionOpen, onOpenChange: onRejectionOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const [pendingReason, setPendingReason] = useState("");
  const [editProduct, setEditProduct] = useState(order.product?._id ?? "");
  const [editQuantity, setEditQuantity] = useState(order.quantity ?? 1);
  const [editPrice, setEditPrice] = useState(order.price ?? "");
  const [editPayout, setEditPayout] = useState(order.payout ?? 0);
  const [currentProductName, setCurrentProductName] = useState(null);
  const [currentQuantity, setCurrentQuantity] = useState(order.quantity);
  const [currentPrice, setCurrentPrice] = useState(order.price);
  const [currentPayout, setCurrentPayout] = useState(order.payout ?? 0);

  const canEdit = currentStatus === "нова" || isSuperAdmin;
  const statusCfg = STATUS_CONFIG[currentStatus] ?? STATUS_CONFIG["нова"];

  const availableProducts = useMemo(
    () => productStore.products.filter((p) => !p.hidden).map((p) => ({ ...p, name: productTitle(p) })),
    [productStore.products]
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(order.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const normalizePhone = (phone) => {
    const d = phone.replace(/\D/g, "");
    if (d.startsWith("00"))               return d.slice(2);          // 0048... → 48...
    if (d.startsWith("0") && d.length === 10) return "359" + d.slice(1); // 0888... → 359888...
    return d;                                                          // 49..., 48... → непроменен
  };

  const phoneHref = order.contactMethod === "WhatsApp"
    ? `https://wa.me/${normalizePhone(order.phone)}`
    : order.contactMethod === "Viber"
    ? `viber://chat?number=${normalizePhone(order.phone)}`
    : `tel:${order.phone}`;

  const productName = currentProductName
    ?? (order.product
      ? [order.product.name, order.product.flavor, order.product.weight && `${order.product.weight}г`, order.product.puffs && `${order.product.puffs}k`]
          .filter(Boolean).join(" ")
      : "—");

  return (
    <Layout title="Детайли на заявката">
      <div className="max-w-xl mx-auto 2xl:px-10">

        {/* Бек бутон */}
        <Button
          variant="light"
          size="sm"
          startContent={<FiArrowLeft className="w-4 h-4" />}
          onPress={() => router.push("/dashboard/client-orders")}
          className="mb-5 text-slate-500 hover:text-[#0071f5] font-medium px-0">
          Назад
        </Button>

        <div className="flex flex-col gap-3">

          {/* ГЛАВНА КАРТА */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

            {/* Цветна лента по статус */}
            <div className={`h-1.5 w-full ${statusCfg.accent}`} />

            {/* Хедър: телефон + статус */}
            <div className="px-5 pt-4 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-col gap-2">
                {/* Телефон с action бутони */}
                <div className="flex items-center gap-2">
                  <a
                    href={phoneHref}
                    className="flex items-center gap-2 text-2xl font-bold text-slate-800 hover:text-[#0071f5] transition-colors">
                    <FiPhone className="w-5 h-5 text-[#0071f5]" />
                    {order.phone}
                  </a>
                  <Tooltip content="Копирано" color="default" isOpen={copied}>
                    <Button isIconOnly size="sm" variant="light" onPress={handleCopy} className="text-slate-400 hover:text-slate-600">
                      {copied ? <FiCheck className="w-4 h-4 text-green-500" /> : <FiCopy className="w-4 h-4" />}
                    </Button>
                  </Tooltip>
                  {order.contactMethod === "Viber" && (
                    <a href={phoneHref} className="p-1.5 rounded-lg bg-[#7360F2]/10 hover:bg-[#7360F2]/20 transition-colors">
                      <FaViber className="w-4 h-4 text-[#7360F2]" />
                    </a>
                  )}
                  {order.contactMethod === "WhatsApp" && (
                    <a href={phoneHref} className="p-1.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors">
                      <FaWhatsapp className="w-4 h-4 text-[#25D366]" />
                    </a>
                  )}
                </div>

                {/* Client badge */}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${order.isNewClient ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                  {order.isNewClient ? "✦ Нов клиент" : "Съществуващ клиент"}
                </span>
              </div>

              {/* Статус */}
              <div className="flex flex-col items-start sm:items-end gap-1.5">
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
                      setStatusChangedAt(["доставена", "отказана"].includes(val) ? new Date() : null);
                    }
                  }}
                  baseClass="w-36"
                  classes={`text-xs font-semibold rounded-lg cursor-pointer w-auto min-w-0 ${STATUS_CONFIG[currentStatus]?.badge} ${["отказана", "доставена"].includes(currentStatus) && !isSuperAdmin ? "opacity-60 pointer-events-none" : ""}`}
                />
                {statusChangedAt && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <FiClock className="w-3 h-3" />
                    {new Date(statusChangedAt).toLocaleDateString("bg-BG", {
                      day: "2-digit", month: "2-digit", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
            </div>

            {/* Продукт + метрики */}
            <div className="mx-4 mb-4 rounded-xl p-4 bg-slate-50 border border-slate-100">
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-base font-bold text-slate-800 leading-snug">{productName}</p>
                {canEdit && (
                  <Button
                    size="sm"
                    variant="solid"
                    color="primary"
                    radius="lg"
                    startContent={<FiEdit2 className="w-3.5 h-3.5" />}
                    onPress={onEditOpen}
                    className="font-semibold shrink-0 bg-white text-[#0071f5] border border-blue-100 shadow-sm">
                    Редактирай
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="bg-white rounded-lg px-3 py-2 flex flex-col items-center shadow-sm border border-white/80 min-w-[72px]">
                  <span className="text-xs text-slate-400 font-medium">Бройки</span>
                  <span className="text-lg font-bold text-slate-800">{currentQuantity}</span>
                </div>
                <div className="bg-white rounded-lg px-3 py-2 flex flex-col items-center shadow-sm border border-white/80 min-w-[96px]">
                  <span className="text-xs text-slate-400 font-medium">Цена</span>
                  <span className="text-lg font-bold text-[#0071f5]">{formatCurrency(currentPrice, 2)}</span>
                </div>
                {isSuperAdmin && (
                  <div className="bg-white rounded-lg px-3 py-2 flex flex-col items-center shadow-sm border border-orange-100 min-w-[96px]">
                    <span className="text-xs text-orange-400 font-medium">За изплащане</span>
                    <span className="text-lg font-bold text-orange-500">{formatCurrency(currentPayout, 2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ДЕТАЙЛИ КАРТА */}
          {(order.address || order.note || currentRejectionReason || order.assignedTo?.name || isSuperAdmin) && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">

              {order.address && (
                <div className="flex items-start gap-3 px-5 py-3.5">
                  <FiMapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium mb-0.5">Адрес</p>
                    <p className="text-sm font-medium text-slate-700">{order.address}</p>
                  </div>
                </div>
              )}

              {order.note && (
                <div className="flex items-start gap-3 px-5 py-3.5">
                  <FiFileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium mb-0.5">Бележка</p>
                    <p className="text-sm font-medium text-slate-700">{order.note}</p>
                  </div>
                </div>
              )}

              {order.deliveryCost > 0 && (
                <div className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <FiTruck className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium mb-0.5">Доставка</p>
                      <p className="text-sm font-medium text-slate-700">Допълнителна доставка</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#0071f5]">{formatCurrency(order.deliveryCost, 2)}</span>
                </div>
              )}

              {currentRejectionReason && (
                <div className="flex items-start gap-3 px-5 py-3.5">
                  <FiAlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-red-400 font-medium mb-0.5">Причина за отказ</p>
                    <p className="text-sm font-medium text-slate-700">{currentRejectionReason}</p>
                  </div>
                </div>
              )}

              {order.assignedTo?.name && (
                <div className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <FiUser className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium mb-0.5">Доставчик</p>
                      <p className="text-sm font-medium text-slate-700">{order.assignedTo.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSuperAdmin && (
                      <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${viewed ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                        {viewed ? <FiEye className="w-3.5 h-3.5" /> : <FiEyeOff className="w-3.5 h-3.5" />}
                        {viewed ? "Видяна" : "Не е видяна"}
                      </span>
                    )}
                    {isSuperAdmin && (
                      <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${order.isPaid ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                        {order.isPaid ? "Изплатена" : "Неизплатена"}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ДАТА КАРТА */}
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

      {/* МОДАЛ: Редактиране */}
      <Modal
        isOpen={isEditOpen}
        onOpenChange={onEditOpenChange}
        title="Редактирай поръчка"
        primaryBtnText="Запази"
        onSave={async () => {
          const success = await clientOrderStore.updateProductPrice(
            order._id, editProduct, Number(editQuantity), Number(editPrice),
            isSuperAdmin ? Number(editPayout) : undefined
          );
          if (success) {
            const selected = availableProducts.find((p) => p._id === editProduct);
            if (selected) setCurrentProductName(selected.name);
            setCurrentQuantity(Number(editQuantity));
            setCurrentPrice(Number(editPrice));
            if (isSuperAdmin) setCurrentPayout(Number(editPayout));
          }
          return success;
        }}>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Продукт</label>
            <Select
              controlled
              value={editProduct}
              items={availableProducts.map((p) => ({ _id: p._id, value: p._id, name: p.name }))}
              onChange={(val) => {
                const selected = availableProducts.find((p) => p._id === val);
                const qty = Number(editQuantity);
                const autoPrice = selected?.sell_prices?.[qty - 1] ?? editPrice;
                const autoPayout = selected?.seller_prices?.[qty - 1] ?? editPayout;
                setEditProduct(val);
                setEditPrice(autoPrice);
                if (isSuperAdmin) setEditPayout(autoPayout);
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Бройка</label>
            <input
              type="number"
              min={1}
              value={editQuantity}
              onChange={(e) => {
                const qty = Number(e.target.value);
                setEditQuantity(e.target.value);
                const selected = availableProducts.find((p) => p._id === editProduct);
                const autoPrice = selected?.sell_prices?.[qty - 1];
                const autoPayout = selected?.seller_prices?.[qty - 1];
                if (autoPrice !== undefined) setEditPrice(autoPrice);
                if (isSuperAdmin && autoPayout !== undefined) setEditPayout(autoPayout);
              }}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Цена</label>
            <input
              type="number"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {isSuperAdmin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-orange-500">За изплащане</label>
              <input
                type="number"
                value={editPayout}
                onChange={(e) => setEditPayout(e.target.value)}
                className="w-full rounded-xl border border-orange-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          )}
        </div>
      </Modal>

      {/* МОДАЛ: Причина за отказ */}
      <Modal
        isOpen={isRejectionOpen}
        onOpenChange={onRejectionOpenChange}
        title="Причина за отказ"
        primaryBtnText="Потвърди"
        onSave={async () => {
          await clientOrderStore.updateStatus(order._id, "отказана", pendingReason);
          setCurrentStatus("отказана");
          setCurrentRejectionReason(pendingReason);
          setStatusChangedAt(new Date());
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
