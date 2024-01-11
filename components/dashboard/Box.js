"use client";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { CiCalendarDate } from "react-icons/ci";
import Modal from "@/components/Modal";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { periods } from "@/data";

const Box = (props) => {
  const modalButton = (
    <>
      <div className='flex gap-3'>
        <span className='bg-blue-400 text-white rounded-full p-2 h-fit mt-1.5'>
          {props.icon}
        </span>

        <div>
          <h2 className='text-lg font-semibold text-slate-800 mb-1'>
            {props.title}
          </h2>

          <div className='text-xs font-semibold text-slate-400 uppercase mb-3'>
            {props.period}
          </div>
        </div>
      </div>

      <div className='text-3xl font-bold text-slate-800 mr-2'>
        {props.value}лв.
      </div>
    </>
  );

  const dropdownButton = (
    <Dropdown>
      <DropdownTrigger>
        <button className='absolute z-50 right-5 top-5 bg-gray-100 p-1 rounded-lg cursor-pointer hover:bg-gray-200 transition-all active:scale-90 focus:outline-none'>
          <HiOutlineDotsHorizontal />
        </button>
      </DropdownTrigger>

      <DropdownMenu
        aria-label='Static Actions'
        selectionMode='single'
        disallowEmptySelection
        selectedKeys={props.period}
        onSelectionChange={props.setPeriod}>
        {periods.map((period) => (
          <DropdownItem
            key={period}
            eventKey={period}>
            {period}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );

  const datePickerButton = (
    <button className='absolute z-50 right-14 top-5 bg-gray-100 p-1 rounded-lg cursor-pointer hover:bg-gray-200 transition-all active:scale-90 focus:outline-none'>
      <CiCalendarDate />
    </button>
  );

  const boxContent = (
    <div
      className={`w-full relative bg-white rounded-md shadow-md border border-slate-200 ${
        props.modal && "cursor-pointer"
      } `}>
      <div className='p-5'>
        {dropdownButton}
        {datePickerButton}

        {modalButton}
      </div>
    </div>
  );

  return props.modal ? (
    <div
      className={`relative w-full bg-white rounded-md shadow-md border border-slate-200 ${
        props.modal && "cursor-pointer"
      } `}>
      <div className='p-5'>
        {dropdownButton}
        {datePickerButton}

        <Modal
          openButton={modalButton}
          isButton={false}
          showFooter={true}
          title={props.modalTitle}>
          {props.modalContent}
        </Modal>
      </div>
    </div>
  ) : (
    boxContent
  );
};

export default Box;
