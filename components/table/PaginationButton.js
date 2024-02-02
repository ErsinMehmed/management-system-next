import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";

const PaginationButton = (props) => {
  return (
    <button
      className={`rounded-lg center-element w-9 h-9 leading-tight group ${
        props.check
          ? "text-blue-400 bg-[#ebf4ff]"
          : "bg-[#f4f4f5] hover:bg-[#e6e6e7] text-gray-500 transition-all"
      }`}
      onClick={props.onClick}
    >
      {props.dotsButton ? (
        <>
          <span className="group-hover:hidden">...</span>

          <span className="hidden group-hover:block">
            {props.dotsButton === "right" ? (
              <MdOutlineKeyboardDoubleArrowRight className="h-5 w-5" />
            ) : (
              <MdOutlineKeyboardDoubleArrowLeft className="h-5 w-5" />
            )}
          </span>
        </>
      ) : (
        props.text
      )}
    </button>
  );
};

export default PaginationButton;
