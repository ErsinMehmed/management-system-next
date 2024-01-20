"use client";
import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import Layout from "@/components/layout/Dashboard";
import Box from "@/components/ad/Box";

const DashboardAds = () => {
  return (
    <Layout title='Реклами'>
      <button className='text-white absolute top-[83px] right-4 sm:right-10 bg-[#0071f5] hover:bg-blue-600 focus:outline-none font-semibold rounded-full text-sm px-5 py-1.5 text-center transition-all active:scale-90'>
        Добави
      </button>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
        <Box />
        <Box />
        <Box />
      </div>
    </Layout>
  );
};

export default observer(DashboardAds);
