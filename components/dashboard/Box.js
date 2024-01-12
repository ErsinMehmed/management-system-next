"use client";
import Modal from "@/components/Modal";

const Box = (props) => {
  const boxContent = (
    <div
      className={`w-full relative bg-white rounded-md shadow-md border border-slate-200 ${
        props.modal && "cursor-pointer"
      } `}
    >
      <div className="p-5">
        <div className="flex gap-3">
          <span className="bg-blue-400 text-white rounded-full p-2 h-fit mt-1.5">
            {props.icon}
          </span>

          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-1">
              {props.title}
            </h2>

            <div className="text-xs font-semibold text-slate-400 uppercase mb-3">
              {props.period}
            </div>
          </div>
        </div>
        <div className="text-3xl font-bold text-slate-800 mr-2">
          {props.value}лв.
        </div>
      </div>
    </div>
  );

  return props.modal ? (
    <Modal
      openButton={boxContent}
      isButton={false}
      showFooter={true}
      title={props.modalTitle}
    >
      {props.modalContent}
    </Modal>
  ) : (
    boxContent
  );
};

export default Box;
