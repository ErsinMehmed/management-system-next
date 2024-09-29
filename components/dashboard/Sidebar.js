"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardLinks } from "@/data";

const SideBar = (props) => {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserRole = localStorage.getItem("userRole");
      setUserRole(storedUserRole);
    }
  }, []);

  const filteredLinks = dashboardLinks.filter((item) =>
    item.role.includes(userRole)
  );

  return (
    <aside
      className={`fixed hidden sm:block top-0 left-0 z-40 ${
        props.show ? "w-16" : "w-52 2xl:w-72"
      } transition-all duration-500 h-screen sm:translate-x-0 bg-gradient-to-r from-[#534bed] via-[#4d44ef] to-[#4b43e7]`}>
      <div className='h-full px-3 py-4 overflow-y-auto border-r border-gray-200'>
        <ul className='space-y-2.5 font-medium'>
          {filteredLinks.map((item, index) => (
            <li key={index}>
              <Link
                title={item.text}
                href={item.link}
                className={`flex items-center ${
                  props.show && "justify-center"
                } ${
                  pathname === item.link && "bg-[#4338ca]"
                }  py-2 px-2.5 text-white rounded-lg font-semibold hover:bg-[#4338ca] group transition-all`}>
                {item.icon}

                <span className={`${props.show ? "hidden" : "block"} ml-2`}>
                  {item.text}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default SideBar;
