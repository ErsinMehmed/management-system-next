import Image from "next/image";
import { HiMenuAlt1 } from "react-icons/hi";
import { IoNotificationsOutline } from "react-icons/io5";
import { FaXmark } from "react-icons/fa6";
import Dropdown from "./AccountDropdown";

const Navbar = (props) => {
  return (
    <nav
      className={`fixed z-30 w-full bg-white border-b border-gray-200 ${
        props.show ? "md:pr-16" : "md:pr-56 2xl:pr-72"
      }`}
    >
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <button
              onClick={props.onMenuClick}
              className="p-2 mr-2 text-gray-600 rounded cursor-pointer hover:text-gray-800 hover:bg-gray-100 transition-all"
            >
              {props.show ? (
                <FaXmark className="md:hidden w-6 h-6" />
              ) : (
                <HiMenuAlt1 className="md:hidden w-6 h-6" />
              )}
              <HiMenuAlt1 className="hidden md:block w-6 h-6" />
            </button>

            <Image
              src="/images/logo.svg"
              alt="Main logo"
              width={30}
              height={30}
              quality={100}
            />
          </div>

          <div className="flex items-center">
            <IoNotificationsOutline className="w-6 h-6 text-gray-400" />

            <div className="h-7 w-0.5 bg-gray-200 ml-4 mr-5 sm:ml-5 sm:mr-7 rounded-full"></div>

            <Dropdown />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
