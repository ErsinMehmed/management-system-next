"use client";
import { useState } from "react";
import { FiPhone, FiCopy, FiCheck, FiClock } from "react-icons/fi";
import { FaViber, FaWhatsapp } from "react-icons/fa";
import { Tooltip, Button } from "@heroui/react";
import Select from "@/components/html/Select";
import { clientOrderStatuses, clientOrderStatusConfig } from "@/data";

function normalizePhone(phone) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0") && digits.length === 10) return "359" + digits.slice(1);
  return digits;
}

function getPhoneHref(phone, contactMethod) {
  const n = normalizePhone(phone);
  if (contactMethod === "WhatsApp") return `https://wa.me/${n}`;
  if (contactMethod === "Viber") return `viber://chat?number=${n}`;
  return `tel:${phone}`;
}

export default function OrderHeader({ order, currentStatus, statusChangedAt, isSuperAdmin, onStatusChange }) {
  const [copied, setCopied] = useState(false);

  const phoneHref = getPhoneHref(order.phone, order.contactMethod);
  const isLocked = ["отказана", "доставена"].includes(currentStatus) && !isSuperAdmin;
  const statusCfg = clientOrderStatusConfig[currentStatus] ?? clientOrderStatusConfig["нова"];

  const handleCopy = () => {
    navigator.clipboard.writeText(order.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-5 pt-4 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { window.location.href = phoneHref; }}
            className="flex items-center gap-2 text-2xl font-bold text-slate-800 hover:text-[#0071f5] transition-colors">
            <FiPhone className="w-5 h-5 text-[#0071f5]" />
            {order.phone}
          </button>
          {order.orderNumber > 0 && (
            <span className="text-sm font-bold text-slate-400">#{order.orderNumber}</span>
          )}
          <Tooltip content="Копирано" color="default" isOpen={copied}>
            <Button isIconOnly size="sm" variant="light" onPress={handleCopy} className="text-slate-400 hover:text-slate-600">
              {copied ? <FiCheck className="w-4 h-4 text-green-500" /> : <FiCopy className="w-4 h-4" />}
            </Button>
          </Tooltip>
          {order.contactMethod === "Viber" && (
            <button
              onClick={() => { window.location.href = phoneHref; }}
              className="p-1.5 rounded-lg bg-[#7360F2]/10 hover:bg-[#7360F2]/20 transition-colors">
              <FaViber className="w-4 h-4 text-[#7360F2]" />
            </button>
          )}
          {order.contactMethod === "WhatsApp" && (
            <button
              onClick={() => { window.location.href = phoneHref; }}
              className="p-1.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors">
              <FaWhatsapp className="w-4 h-4 text-[#25D366]" />
            </button>
          )}
        </div>

        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${order.isNewClient ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
          {order.isNewClient ? "✦ Нов клиент" : "Съществуващ клиент"}
        </span>
      </div>

      <div className="flex flex-col items-start sm:items-end gap-1.5">
        <Select
          controlled
          value={currentStatus}
          disabled={isLocked}
          items={clientOrderStatuses.map((s) => ({ _id: s, value: s, name: s }))}
          onChange={onStatusChange}
          baseClass="w-36"
          classes={`text-xs font-semibold rounded-lg cursor-pointer w-auto min-w-0 ${statusCfg.badge} ${isLocked ? "opacity-60 pointer-events-none" : ""}`}
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
  );
}
