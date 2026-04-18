"use client";
import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalBody, Button } from "@heroui/react";
import { FiUserPlus, FiPhone, FiX } from "react-icons/fi";
import Input from "@/components/html/Input";

const AddClientModal = ({ isOpen, onClose, onAdded }) => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) { setPhone(""); setName(""); setError(""); }
  }, [isOpen]);

  const handlePhoneChange = (val) => {
    const cleaned = val.replace(/[^\d+]/g, "").replace(/(?<=.)\+/g, "");
    setPhone(cleaned);
    setError("");
  };

  const save = async () => {
    const trimmed = phone.trim();
    if (!/^\+?[0-9]{7,15}$/.test(trimmed)) {
      setError("Невалиден телефонен номер");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/client-phones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: trimmed, name: name.trim() }),
      });
      if (!res.ok) {
        setError("Възникна грешка");
        return;
      }
      onAdded?.({ phone: trimmed, name: name.trim() });
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="sm" backdrop="blur" hideCloseButton>
      <ModalContent>
        {(close) => (
          <ModalBody className="p-0">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <FiUserPlus className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-bold text-slate-800">Нов клиент</p>
              </div>
              <button onClick={close} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <FiX className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <Input
                type="text"
                label="Телефон"
                placeholder="0899..."
                value={phone}
                onChange={handlePhoneChange}
                errorMessage={error}
              />
              <Input
                type="text"
                label="Име (по избор)"
                placeholder="Напр. Иван Петров"
                value={name}
                onChange={setName}
              />
            </div>

            <div className="px-5 pb-5 flex items-center justify-end gap-2">
              <Button variant="flat" radius="lg" className="font-semibold" onPress={close}>Отказ</Button>
              <Button color="primary" radius="lg" className="font-semibold"
                isDisabled={!phone.trim()} isLoading={saving} onPress={save}>
                Добави
              </Button>
            </div>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddClientModal;
