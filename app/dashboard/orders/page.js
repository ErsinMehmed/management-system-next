"use client";
import React, { useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";
import Layout from "@/components/layout/Dashboard";
import Modal from "@/components/Modal";
import Select from "@/components/html/Select";
import Input from "@/components/html/Input";
import { commonStore, orderStore, productStore } from "@/stores/useStore";

const DashboardOrders = () => {
  const { orderData, setOrderData, clearOrderData, createOrder, loadOrders } =
    orderStore;
  const { products, loadProducts } = productStore;
  const { errorFields, errorMessage, successMessage } = commonStore;

  useEffect(() => {
    // loadOrders(false);
  }, [loadOrders]);

  useEffect(() => {
    loadProducts(false);
  }, [loadProducts]);

  const productTitle = (product) => {
    switch (product.name) {
      case "Exotic Whip":
      case "Great Whip":
      case "Miami Magic":
        return `${product.name} ${product.weight}гр.`;
      case "Балони":
        return `${product.name} пакет ${product.count}бр.`;
      case "Накрайник с вкус":
        return `${product.name} ${product.flavor}`;
      default:
        return product.name;
    }
  };

  const updatedProducts = useMemo(() => {
    return products.map((product) => ({
      ...product,
      name: productTitle(product),
    }));
  }, [products]);

  const handleInputChange = (name, value) => {
    let updatedData = { ...orderData };

    switch (name) {
      case "product":
        if (value === "") {
          clearOrderData();
          return;
        }

        const selectedProduct = products.find(
          (product) => product._id === value
        );

        updatedData.price = selectedProduct ? selectedProduct.price : 0;
        updatedData.total_amount =
          updatedData.quantity && selectedProduct.price * updatedData.quantity;
        break;
      case "quantity":
        updatedData.total_amount = updatedData.price * value;
        break;
      default:
        break;
    }

    setOrderData({ ...updatedData, [name]: value });
  };

  return (
    <Layout>
      <Modal
        saveBtnAction={createOrder}
        openBtnText="Добави"
        title="Добави поръчка"
      >
        <div className="space-y-3.5">
          <Select
            items={updatedProducts}
            label="Избери продукт"
            value={orderData.product || ""}
            errorMessage={errorFields.product}
            onChange={(value) => handleInputChange("product", value)}
          />

          <Input
            type="text"
            label="Количество"
            value={orderData.quantity || ""}
            disabled={!orderData.product}
            errorMessage={errorFields.quantity}
            onChange={(value) => handleInputChange("quantity", value)}
          />

          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-[#f4f4f5] p-5 text-slate-600 rounded-lg shadow-sm text-center font-semibold">
              <div className="text-sm">Единична цена</div>

              <div>
                {orderData.price
                  ? orderData.price.toFixed(2) + "лв."
                  : "0.00лв."}
              </div>
            </div>

            <div className="bg-[#f4f4f5] p-5 text-slate-600 rounded-lg shadow-sm text-center font-semibold">
              <div className="text-sm">Обща сума</div>

              <div>
                {orderData.total_amount
                  ? orderData.total_amount.toFixed(2) + "лв."
                  : "0.00лв."}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default observer(DashboardOrders);
