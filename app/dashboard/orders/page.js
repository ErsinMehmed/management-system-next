"use client";
import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import Layout from "@/components/layout/Dashboard";
import { orderStore } from "@/stores/useStore";

const DashboardOrders = () => {
  const { loadOrders } = orderStore;

  useEffect(() => {
    loadOrders(false);
  }, [loadOrders]);

  return <Layout>ersin</Layout>;
};

export default observer(DashboardOrders);
