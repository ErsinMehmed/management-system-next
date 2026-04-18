"use client";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiFileText } from "react-icons/fi";
import Modal from "@/components/Modal";
import ClientOrderForm from "@/components/forms/ClientOrder";
import { clientOrderStore, commonStore, productStore } from "@/stores/useStore";
import { productTitle } from "@/utils";

const CreateOrderModal = observer(({ isOpen, onOpenChange, sellers, isSuperAdmin }) => {
  const { orderData, isCreating } = clientOrderStore;
  const { errorFields } = commonStore;
  const [localErrors, setLocalErrors] = useState({});
  const [clientNotes, setClientNotes] = useState([]);
  const notesTimer = useRef(null);

  useEffect(() => {
    const phone = orderData.phone?.trim();
    if (notesTimer.current) clearTimeout(notesTimer.current);
    if (!phone || !/^\+?[0-9]{7,15}$/.test(phone)) { setClientNotes([]); return; }

    notesTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/client-phones/${encodeURIComponent(phone)}`);
        const json = await res.json();
        setClientNotes(json?.notes || []);
      } catch { setClientNotes([]); }
    }, 400);

    return () => notesTimer.current && clearTimeout(notesTimer.current);
  }, [orderData.phone]);

  const availableProducts = useMemo(
    () => productStore.products.filter((p) => !p.hidden).map((p) => ({ ...p, name: productTitle(p) })),
    [productStore.products]
  );

  const handleFieldChange = (name, value) => {
    if (localErrors[name]) setLocalErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "phone") {
      const cleaned = value.replace(/[^\d+]/g, "").replace(/(?<=.)\+/g, "");
      clientOrderStore.setOrderData({ ...orderData, phone: cleaned });
      return;
    }
    if (name === "product") {
      const selected = availableProducts.find((p) => p._id === value);
      const autoPrice = selected?.sell_prices?.[Number(orderData.quantity) - 1] ?? "";
      clientOrderStore.setOrderData({ ...orderData, product: value, price: autoPrice });
    } else if (name === "quantity") {
      const selected = availableProducts.find((p) => p._id === orderData.product);
      const autoPrice = selected?.sell_prices?.[Number(value) - 1] ?? "";
      clientOrderStore.setOrderData({ ...orderData, quantity: value, price: autoPrice });
    } else if (name === "product2") {
      const selected = availableProducts.find((p) => p._id === value);
      const autoPrice2 = selected?.sell_prices?.[Number(orderData.quantity2) - 1] ?? "";
      clientOrderStore.setOrderData({ ...orderData, product2: value, price2: autoPrice2 });
    } else if (name === "quantity2") {
      const selected = availableProducts.find((p) => p._id === orderData.product2);
      const autoPrice2 = selected?.sell_prices?.[Number(value) - 1] ?? "";
      clientOrderStore.setOrderData({ ...orderData, quantity2: value, price2: autoPrice2 });
    } else {
      clientOrderStore.setOrderData({ ...orderData, [name]: value });
    }
  };

  const validate = () => {
    const errs = {};
    if (!orderData.phone?.trim()) {
      errs.phone = "Въведи телефон";
    } else if (!/^\+?[0-9]{7,15}$/.test(orderData.phone.trim())) {
      errs.phone = "Невалиден телефонен номер";
    }
    if (!orderData.product) errs.product = "Избери продукт";
    if (!orderData.quantity || Number(orderData.quantity) <= 0) errs.quantity = "Въведи брой";
    if (!orderData.price || Number(orderData.price) <= 0) errs.price = "Въведи цена";
    setLocalErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const [apiError, setApiError] = useState("");

  const handleSave = async () => {
    setApiError("");
    if (!validate()) return false;
    const result = await clientOrderStore.createOrder();
    if (!result) {
      setApiError(commonStore.errorMessage || "Възникна грешка");
    }
    return result;
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} title="Добави поръчка" isLoading={isCreating} onSave={handleSave}>
      {clientNotes.length > 0 && (
        <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl px-3 py-2.5 flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <FiFileText className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Бележки за клиента</p>
            <ul className="space-y-0.5">
              {clientNotes.map((n) => (
                <li key={n._id} className="text-xs text-slate-700 leading-snug">• {n.text}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <ClientOrderForm
        data={orderData}
        errorFields={{ ...localErrors, ...errorFields }}
        products={availableProducts}
        sellers={sellers}
        handleFieldChange={handleFieldChange}
        isSuperAdmin={isSuperAdmin}
      />
    </Modal>
  );
});

export default CreateOrderModal;
