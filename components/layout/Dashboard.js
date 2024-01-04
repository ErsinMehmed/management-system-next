"use client";
import React, { useState } from "react";
import Navbar from "@/components/dashboard/Navbar";
import SideBar from "@/components/dashboard/Sidebar";
import MobileMenu from "@/components/dashboard/MobileMenu";

const DashboardLayout = (props) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleMenu = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="flex items-center w-full bg-[#f5f5f7]">
      <SideBar show={isVisible} />

      <MobileMenu show={isVisible} />

      <div
        className={`${
          isVisible ? "sm:ml-16" : "sm:ml-56 2xl:ml-72"
        } transition-all duration-500 w-full min-h-screen`}
      >
        <Navbar onMenuClick={toggleMenu} show={isVisible} />

        <div className="mt-16 p-5">{props.children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
