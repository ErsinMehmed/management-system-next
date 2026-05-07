"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/dashboard/Navbar";
import SideBar from "@/components/dashboard/Sidebar";
import MobileMenu from "@/components/dashboard/MobileMenu";
import Alert from "@/components/Alert";
import { productStore } from "@/stores/useStore";
import { I18nProvider } from "@react-aria/i18n";
import PushNotificationInit from "@/components/PushNotificationInit";

const DashboardLayout = ({ title, breadcrumb, children }) => {
  const { data: session } = useSession();
  const { loadProductsIfNotLoaded } = productStore;
  const [isVisible, setIsVisible] = useState(false);
  const isSeller = session?.user?.role === "Seller";
  const hasBreadcrumb = Array.isArray(breadcrumb) && breadcrumb.length > 0;

  useEffect(() => {
    loadProductsIfNotLoaded();
  }, []);

  const toggleMenu = () => {
    setIsVisible(!isVisible);
  };

  return (
    <I18nProvider locale='bg-BG'>
      <PushNotificationInit />
      <Alert />

      <div className='flex items-center w-full bg-[#f5f5f7]'>
        {!isSeller && <SideBar show={isVisible} />}
        {!isSeller && <MobileMenu show={isVisible} />}

        <div
          className={`${
            !isSeller && (isVisible ? "sm:ml-16" : "sm:ml-52 2xl:ml-72")
          } transition-all duration-500 w-full min-h-screen`}>
          <Navbar
            onMenuClick={toggleMenu}
            show={isVisible}
            hideSidebarToggle={isSeller}
            title={title}
            breadcrumb={breadcrumb}
          />

          <div className='mt-16'>
            {/* Mobile-only заглавна лента — компактна. На десктоп title-ът е в Navbar-а. */}
            {(title || hasBreadcrumb) && (
              <div className='sm:hidden flex items-center px-4 py-2 text-sm font-semibold text-slate-700 border-b border-gray-200 bg-white truncate'>
                {hasBreadcrumb
                  ? breadcrumb.map((item, i) => (
                      <span key={i} className='flex items-center min-w-0'>
                        {i > 0 && (
                          <span className='mx-1.5 text-slate-300'>›</span>
                        )}
                        <span
                          className={`truncate ${
                            i === breadcrumb.length - 1
                              ? "text-slate-700"
                              : "text-slate-400 font-medium"
                          }`}>
                          {item.label}
                        </span>
                      </span>
                    ))
                  : title}
              </div>
            )}

            <div className='relative p-4 sm:p-5'>{children}</div>
          </div>
        </div>
      </div>
    </I18nProvider>
  );
};

export default DashboardLayout;
