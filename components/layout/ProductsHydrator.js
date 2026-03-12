"use client";
import { useRef } from "react";
import { productStore } from "@/stores/useStore";

export default function ProductsHydrator({ products, children }) {
  const hydrated = useRef(false);

  if (!hydrated.current && products?.length > 0) {
    productStore.hydrate(products);
    hydrated.current = true;
  }

  return children;
}
