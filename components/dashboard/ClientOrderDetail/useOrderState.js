import { useState, useEffect, useMemo } from "react";
import { productStore } from "@/stores/useStore";
import { productTitle } from "@/utils";

function buildProductName(product) {
  if (!product) return "—";

  return [product.name, product.flavor, product.weight && `${product.weight}г`, product.puffs && `${product.puffs}k`]
    .filter(Boolean)
    .join(" ");
}

export function useOrderState(order) {
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [currentRejectionReason, setCurrentRejectionReason] = useState(order.rejectionReason || "");
  const [statusChangedAt, setStatusChangedAt] = useState(order.statusChangedAt || null);
  const [viewed, setViewed] = useState(order.viewedBySeller || false);

  const [currentProductName, setCurrentProductName] = useState(null);
  const [currentQuantity, setCurrentQuantity] = useState(order.quantity);
  const [currentPrice, setCurrentPrice] = useState(order.price);
  const [currentPayout, setCurrentPayout] = useState(order.payout ?? 0);
  const [currentSecondProduct, setCurrentSecondProduct] = useState(order.secondProduct?.product ?? null);
  const [currentQuantity2, setCurrentQuantity2] = useState(order.secondProduct?.quantity ?? 0);
  const [currentPrice2, setCurrentPrice2] = useState(order.secondProduct?.price ?? 0);
  const [currentDistributorPayout, setCurrentDistributorPayout] = useState(order.distributorPayout ?? 0);

  // Sync on server refresh
  useEffect(() => {
    setCurrentStatus(order.status);
    setCurrentRejectionReason(order.rejectionReason || "");
    setStatusChangedAt(order.statusChangedAt || null);
  }, [order.status, order.rejectionReason, order.statusChangedAt]);

  const availableProducts = useMemo(
    () => productStore.products.filter((p) => !p.hidden).map((p) => ({ ...p, name: productTitle(p) })),
    [productStore.products]
  );

  const productName = currentProductName ?? buildProductName(order.product);
  const secondProductName = currentSecondProduct ? buildProductName(currentSecondProduct) : null;

  return {
    currentStatus, setCurrentStatus,
    currentRejectionReason, setCurrentRejectionReason,
    statusChangedAt, setStatusChangedAt,
    viewed, setViewed,
    productName, secondProductName,
    currentQuantity, setCurrentQuantity,
    currentPrice, setCurrentPrice,
    currentPayout, setCurrentPayout,
    currentSecondProduct, setCurrentSecondProduct,
    setCurrentProductName,
    currentQuantity2, setCurrentQuantity2,
    currentPrice2, setCurrentPrice2,
    currentDistributorPayout, setCurrentDistributorPayout,
    availableProducts,
  };
}
