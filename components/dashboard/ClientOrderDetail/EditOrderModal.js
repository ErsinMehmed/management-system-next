"use client";
import { useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import Modal from "@/components/Modal";
import Select from "@/components/html/Select";
import { clientOrderStore } from "@/stores/useStore";

function FormField({ label, accent, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={`text-xs font-semibold ${accent === "orange" ? "text-orange-500" : "text-slate-500"}`}>
        {label}
      </label>
      {children}
    </div>
  );
}

function NumberInput({ borderClass = "border-gray-200", focusClass = "focus:ring-blue-500", className = "", ...props }) {
  return (
    <input
      type="number"
      {...props}
      className={`w-full rounded-xl border px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 ${borderClass} ${focusClass} ${className}`}
    />
  );
}

export default function EditOrderModal({ isOpen, onOpenChange, order, availableProducts, isSuperAdmin, onSuccess }) {
  const [editProduct, setEditProduct] = useState(order.product?._id ?? "");
  const [editQuantity, setEditQuantity] = useState(order.quantity ?? 1);
  const [editPrice, setEditPrice] = useState(order.price ?? "");
  const [editPayout, setEditPayout] = useState(order.payout ?? 0);
  const [editProduct2, setEditProduct2] = useState(order.secondProduct?.product?._id ?? "");
  const [editQuantity2, setEditQuantity2] = useState(order.secondProduct?.quantity ?? "");
  const [editPrice2, setEditPrice2] = useState(order.secondProduct?.price ?? "");
  const [showSecond, setShowSecond] = useState(!!order.secondProduct?.product);

  const handleProductChange = (val) => {
    const selected = availableProducts.find((p) => p._id === val);
    const qty = Number(editQuantity);
    setEditProduct(val);
    setEditPrice(selected?.sell_prices?.[qty - 1] ?? editPrice);
    if (isSuperAdmin) setEditPayout(selected?.seller_prices?.[qty - 1] ?? editPayout);
  };

  const handleQuantityChange = (e) => {
    const qty = Number(e.target.value);
    setEditQuantity(e.target.value);
    const selected = availableProducts.find((p) => p._id === editProduct);
    if (selected?.sell_prices?.[qty - 1] !== undefined) setEditPrice(selected.sell_prices[qty - 1]);
    if (isSuperAdmin && selected?.seller_prices?.[qty - 1] !== undefined) setEditPayout(selected.seller_prices[qty - 1]);
  };

  const handleProduct2Change = (val) => {
    const sel = availableProducts.find((p) => p._id === val);
    const qty = Number(editQuantity2);
    setEditProduct2(val);
    setEditPrice2(sel?.sell_prices?.[qty - 1] ?? editPrice2);
  };

  const handleQuantity2Change = (e) => {
    const qty = Number(e.target.value);
    setEditQuantity2(e.target.value);
    const sel = availableProducts.find((p) => p._id === editProduct2);
    if (sel?.sell_prices?.[qty - 1] !== undefined) setEditPrice2(sel.sell_prices[qty - 1]);
  };

  const removeSecondProduct = () => {
    setShowSecond(false);
    setEditProduct2("");
    setEditQuantity2("");
    setEditPrice2("");
  };

  const handleSave = async () => {
    const secondProductPayload =
      showSecond && editProduct2
        ? { product: editProduct2, quantity: Number(editQuantity2), price: Number(editPrice2) || 0 }
        : null;

    const success = await clientOrderStore.updateProductPrice(
      order._id,
      editProduct,
      Number(editQuantity),
      Number(editPrice),
      isSuperAdmin ? Number(editPayout) : undefined,
      secondProductPayload
    );

    if (success) {
      const selected = availableProducts.find((p) => p._id === editProduct);
      const selected2 = showSecond && editProduct2 ? availableProducts.find((p) => p._id === editProduct2) : null;
      onSuccess({
        productName: selected?.name ?? null,
        quantity: Number(editQuantity),
        price: Number(editPrice),
        payout: isSuperAdmin ? Number(editPayout) : undefined,
        secondProduct: selected2 ?? null,
        quantity2: showSecond && editProduct2 ? Number(editQuantity2) : 0,
        price2: showSecond && editProduct2 ? Number(editPrice2) || 0 : 0,
      });
    }
    return success;
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} title="Редактирай поръчка" primaryBtnText="Запази" onSave={handleSave}>
      <div className="flex flex-col gap-4 py-2">
        <FormField label="Продукт">
          <Select
            controlled
            value={editProduct}
            items={availableProducts.map((p) => ({ _id: p._id, value: p._id, name: p.name }))}
            onChange={handleProductChange}
          />
        </FormField>

        <FormField label="Бройка">
          <NumberInput min={1} value={editQuantity} onChange={handleQuantityChange} />
        </FormField>

        <FormField label="Обща цена">
          <NumberInput value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
        </FormField>

        {isSuperAdmin && (
          <FormField label="За изплащане" accent="orange">
            <NumberInput
              value={editPayout}
              onChange={(e) => setEditPayout(e.target.value)}
              borderClass="border-orange-200"
              focusClass="focus:ring-orange-400"
            />
          </FormField>
        )}

        {showSecond ? (
          <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3.5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#0071f5]">Втори продукт</span>
              <button
                type="button"
                onClick={removeSecondProduct}
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-red-100 flex items-center justify-center transition-colors">
                <FiX className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
              </button>
            </div>
            <Select
              controlled
              value={editProduct2}
              items={availableProducts.filter((p) => p._id !== editProduct).map((p) => ({ _id: p._id, value: p._id, name: p.name }))}
              onChange={handleProduct2Change}
            />
            <NumberInput
              min={1}
              placeholder="Брой"
              value={editQuantity2}
              disabled={!editProduct2}
              onChange={handleQuantity2Change}
              borderClass="border-blue-100"
              className="disabled:opacity-50"
            />
            <NumberInput
              placeholder="Цена"
              value={editPrice2}
              disabled={!editProduct2}
              onChange={(e) => setEditPrice2(e.target.value)}
              borderClass="border-blue-100"
              className="disabled:opacity-50"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowSecond(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-slate-200 text-slate-400 hover:border-[#0071f5]/40 hover:text-[#0071f5] hover:bg-blue-50/30 transition-all text-sm font-medium">
            <FiPlus className="w-4 h-4" />
            Добави втори продукт
          </button>
        )}
      </div>
    </Modal>
  );
}
