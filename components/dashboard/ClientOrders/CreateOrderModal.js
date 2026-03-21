"use client";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import Modal from "@/components/Modal";
import ClientOrderForm from "@/components/forms/ClientOrder";
import { clientOrderStore, commonStore, productStore } from "@/stores/useStore";
import { productTitle } from "@/utils";

const CreateOrderModal = observer(({ isOpen, onOpenChange, sellers }) => {
  const { orderData, isCreating } = clientOrderStore;
  const { errorFields } = commonStore;

  const availableProducts = useMemo(
    () => productStore.products.filter((p) => !p.hidden).map((p) => ({ ...p, name: productTitle(p) })),
    [productStore.products]
  );

  const handleFieldChange = (name, value) => {
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

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} title="Добави поръчка" isLoading={isCreating} onSave={() => clientOrderStore.createOrder()}>
      <ClientOrderForm
        data={orderData}
        errorFields={errorFields}
        products={availableProducts}
        sellers={sellers}
        handleFieldChange={handleFieldChange}
      />
    </Modal>
  );
});

export default CreateOrderModal;
