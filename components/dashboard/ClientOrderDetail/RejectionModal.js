"use client";
import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { clientOrderStore } from "@/stores/useStore";

export default function RejectionModal({ isOpen, onOpenChange, orderId, onSuccess }) {
  const [reason, setReason] = useState("");

  // Reset reason each time modal opens
  useEffect(() => {
    if (isOpen) setReason("");
  }, [isOpen]);

  const handleSave = async () => {
    await clientOrderStore.updateStatus(orderId, "отказана", reason);
    onSuccess(reason);
    return true;
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} title="Причина за отказ" primaryBtnText="Потвърди" onSave={handleSave}>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Въведи причина за отказа..."
        rows={4}
        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
    </Modal>
  );
}
