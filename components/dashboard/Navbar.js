"use client";
import Image from "next/image";
import { HiMenuAlt1 } from "react-icons/hi";
import { FaXmark } from "react-icons/fa6";
import Modal from "@/components/Modal";
import Chat from "@/components/Chat";
import Dropdown from "./AccountDropdown";

const Navbar = (props) => {
  return (
    <nav
      className={`fixed z-30 w-full bg-white border-b border-gray-200 ${
        props.show ? "md:pr-16" : "sm:pr-56 2xl:pr-72"
      }`}>
      <div className='px-3 py-3 lg:px-5 lg:pl-3'>
        <div className='flex-container'>
          <div className='flex items-center justify-start'>
            <button
              onClick={props.onMenuClick}
              className='p-2 mr-2 text-gray-600 rounded cursor-pointer hover:text-gray-800 hover:bg-gray-100 transition-all'>
              {props.show ? (
                <FaXmark className='sm:hidden w-6 h-6' />
              ) : (
                <HiMenuAlt1 className='sm:hidden w-6 h-6' />
              )}

              <HiMenuAlt1 className='hidden sm:block w-6 h-6' />
            </button>

            <Image
              src='/images/logo.svg'
              alt='Main logo'
              width={30}
              height={30}
              quality={100}
            />
          </div>

          <div className='flex items-center'>
            {/* {process.env.МODE === "dev" && (
              <Modal
                showFooter={true}
                showHeader={true}
                openButton={
                  <IoChatbubblesOutline className='w-6 h-6 text-gray-400 mr-3 cursor-pointer' />
                }>
                <Chat />
              </Modal>
            )} */}

            <Dropdown />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
