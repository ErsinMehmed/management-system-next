"use client";
import { useState } from "react";
import Modal from "@/components/Modal";
import { clientOrderStore } from "@/stores/useStore";
import { formatCurrency } from "@/utils";

export default function PayoutModal({ isOpen, onOpenChange, pendingPayout }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    await clientOrderStore.markSellerAsPaid(pendingPayout._id);
    setIsLoading(false);
    return true;
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} title="Потвърди изплащане" primaryBtnText="Изплати" isLoading={isLoading} onSave={handleSave}>
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
  );
}
