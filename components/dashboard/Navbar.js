"use client";
import Image from "next/image";
import Link from "next/link";
import { HiMenuAlt1 } from "react-icons/hi";
import { FaXmark } from "react-icons/fa6";
import { FiChevronRight } from "react-icons/fi";
import Dropdown from "./AccountDropdown";
import NotificationBell from "./NotificationBell";

const Breadcrumb = ({ items }) => (
  <nav aria-label="Breadcrumb" className="flex items-center min-w-0 text-sm">
    {items.map((item, i) => {
      const isLast = i === items.length - 1;
      const content = (
        <span
          className={`truncate ${
            isLast
              ? "font-semibold text-slate-700"
              : "font-medium text-slate-400 hover:text-slate-600 transition-colors"
          }`}>
          {item.label}
        </span>
      );
      return (
        <span key={i} className="flex items-center min-w-0">
          {i > 0 && (
            <FiChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-300 shrink-0" />
          )}
          {item.href && !isLast ? (
            <Link href={item.href} className="min-w-0">
              {content}
            </Link>
          ) : (
            content
          )}
        </span>
      );
    })}
  </nav>
);

const Navbar = ({
  onMenuClick,
  show,
  hideSidebarToggle,
  title,
  breadcrumb,
}) => {
  const hasBreadcrumb = Array.isArray(breadcrumb) && breadcrumb.length > 0;

  return (
    <nav
      className={`fixed z-30 w-full bg-white border-b border-gray-200 ${
        hideSidebarToggle ? "" : show ? "md:pr-16" : "sm:pr-56 2xl:pr-72"
      }`}>
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex-container">
          <div className="flex items-center justify-start shrink-0">
            {!hideSidebarToggle && (
              <button
                onClick={onMenuClick}
                className="p-2 mr-2 text-gray-600 rounded cursor-pointer hover:text-gray-700 hover:bg-gray-100 transition-all">
                {show ? (
                  <FaXmark className="sm:hidden w-6 h-6" />
                ) : (
                  <HiMenuAlt1 className="sm:hidden w-6 h-6" />
                )}

                <HiMenuAlt1 className="hidden sm:block w-6 h-6" />
              </button>
            )}

            <Image
              src="/images/logo.svg"
              alt="Main logo"
              width={30}
              height={30}
              quality={100}
            />
          </div>

          {/* Breadcrumb / title в middle — само от sm нагоре, на mobile се показва под navbar */}
          <div className="hidden sm:flex flex-1 min-w-0 items-center px-4">
            {hasBreadcrumb ? (
              <Breadcrumb items={breadcrumb} />
            ) : title ? (
              <h1 className="text-base font-semibold text-slate-700 truncate">
                {title}
              </h1>
            ) : null}
          </div>

          <div className="flex items-center gap-x-2 shrink-0">
            <NotificationBell />
            <Dropdown />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
