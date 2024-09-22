"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/dashboard/Navbar";
import SideBar from "@/components/dashboard/Sidebar";
import MobileMenu from "@/components/dashboard/MobileMenu";
import Alert from "@/components/Alert";
import { productStore } from "@/stores/useStore";

const DashboardLayout = (props) => {
  const { loadProducts } = productStore;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const toggleMenu = () => {
    setIsVisible(!isVisible);
  };

  return (
    <>
      <Alert />

      <div className='flex items-center w-full bg-[#f5f5f7]'>
        <SideBar show={isVisible} />

        <MobileMenu show={isVisible} />

        <div
          className={`${
            isVisible ? "sm:ml-16" : "sm:ml-52 2xl:ml-72"
          } transition-all duration-500 w-full min-h-screen`}>
          <Navbar
            onMenuClick={toggleMenu}
            show={isVisible}
          />

          <div className='mt-16'>
            <div className='p-5 text-xl 2xl:text-2xl font-semibold text-slate-600 border-b border-gray-300'>
              {props.title}
            </div>

            <div className='p-4 sm:p-5'>{props.children}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
