"use client";
import { observer } from "mobx-react-lite";
import Layout from "@/components/layout/Dashboard";
import { commonStore, productStore } from "@/stores/useStore";

const DashboardSales = () => {
  const { products, productData, updateProduct, setProductData } = productStore;
  const { errorFields } = commonStore;

  return <Layout>ersin</Layout>;
};

export default observer(DashboardSales);
