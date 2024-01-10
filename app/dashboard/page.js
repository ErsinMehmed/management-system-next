"use client";
import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { sellStore } from "@/stores/useStore";
import Layout from "@/components/layout/Dashboard";
import PieChart from "@/components/charts/PieChart";

const Dashboard = () => {
  const { sellStats, loadSaleStats, setPieChartPeriod } = sellStore;

  const pieChartBoxColor = ["blue", "purple"];

  useEffect(() => {
    loadSaleStats();
  }, [loadSaleStats]);

  return (
    <Layout title="Администраторско табло">
      <PieChart
        data={sellStats.sales}
        status={sellStats.status}
        message={sellStats.message}
      />
    </Layout>
  );
};

export default observer(Dashboard);
