"use client";
import React, { useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";
import Layout from "@/components/layout/Dashboard";

const DashboardAds = () => {
  return <Layout title='Реклами'></Layout>;
};

export default observer(DashboardAds);
