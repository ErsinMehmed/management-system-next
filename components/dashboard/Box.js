"use client";
import Modal from "@/components/Modal";
import moment from "moment";
import { formatCurrency } from "@/utils";

const Box = (props) => {
  const boxContent = (
    <div
      className={`w-full relative bg-white rounded-md shadow-md border border-slate-200 ${
        props.modal && "cursor-pointer"
      } `}>
      <div className='p-5'>
        <div className='flex gap-3'>
          <span className='bg-blue-400 text-white rounded-full p-2 h-fit mt-1.5'>
            {props.icon}
          </span>

          <div>
            <h2 className='text-lg font-semibold text-slate-800 mb-0.5'>
              {props.title}
            </h2>

            <div className='text-xs font-semibold text-slate-400 uppercase mb-3'>
              {props.period.dateFrom && props.period.dateTo
                ? `${moment(props.period.dateFrom).format(
                    "DD.MM.YYYY"
                  )} - ${moment(props.period.dateTo).format("DD.MM.YYYY")}`
                : props.period.dateFrom
                ? `От ${moment(props.period.dateFrom).format("DD.MM.YYYY")}`
                : props.period.dateTo
                ? `До ${moment(props.period.dateTo).format("DD.MM.YYYY")}`
                : props.period.period}
            </div>
          </div>
        </div>
        {props.value === undefined || isNaN(props.value) ? (
          <>
            <div className='h-2 animate-pulse bg-gray-200 rounded-full w-10/12 my-2.5' />
            <div className='h-2 animate-pulse bg-gray-200 rounded-full' />
          </>
        ) : (
          <div className='text-3xl font-bold text-slate-800 mr-2'>
            {isNaN(props.value) ? "00.00" : formatCurrency(props.value, 2)}лв.
          </div>
        )}
      </div>
    </div>
  );

  return props.modal ? (
    <Modal
      openButton={boxContent}
      isButton={false}
      showFooter={true}
      title={props.modalTitle}>
      {props.modalContent}
    </Modal>
  ) : (
    boxContent
  );
};

export default Box;
