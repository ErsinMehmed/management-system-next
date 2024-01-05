import Link from "next/link";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { HiOutlineFilter } from "react-icons/hi";
import { FiPlus } from "react-icons/fi";

const Select = (props) => {
  const handleChange = (event) => {
    if (props.onChange) {
      props.onChange(event.target.value);
    }
  };

  return props.isLoading ? (
    <div className="mt-5 h-12 2xl:h-14 w-full bg-white px-4 rounded-lg mb-5 2xl:mb-4 flex items-center border border-gray-300 shadow-sm">
      <div className="w-6 mr-4">
        <div className="h-1 animate-pulse bg-gray-200 rounded-full w-10/12 mb-2" />
        <div className="h-1 animate-pulse bg-gray-200 rounded-full" />
      </div>

      <div className="w-full">
        <div className="h-1 animate-pulse bg-gray-200 rounded-full w-10/12 mb-2" />
        <div className="h-1 animate-pulse bg-gray-200 rounded-full" />
      </div>

      <div className="bg-[#f4f4f5] rounded-full w-1/6 2xl:w-[9%] ml-5 px-1 sm:px-5 py-2.5 2xl:py-3">
        <div className="sm:h-1 animate-pulse bg-gray-200 rounded-full w-10/12 mb-2" />
        <div className="sm:h-1 animate-pulse bg-gray-200 rounded-full" />
      </div>

      <div className="bg-[#f4f4f5] rounded-full w-[2.7%] h-10 ml-2 px-1 sm:px-5" />
    </div>
  ) : (
    <div className="relative my-5 2xl:mb-4 shadow rounded-lg">
      <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 sm:pl-3.5 pointer-events-none">
        <HiOutlineMagnifyingGlass className="h-6 w-6 sm:mt-0.5 text-gray-400" />
      </div>

      <input
        type="text"
        value={props.value}
        onChange={handleChange}
        disabled={props.disabled}
        className="bg-white border border-gray-200 disabled:bg-gray-100 focus:border-gray-300 text-gray-800 text-sm sm:text-base focus:outline-none focus:ring-0 rounded-lg block w-full pl-10 sm:pl-12 h-12 2xl:h-14"
        placeholder={`Въведи ${props.placeholder}`}
      />

      <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 sm:pr-3.5">
        {props.button}

        <Link
          href="/dashboard/ads/create"
          className="sm:hidden text-white bg-[#0071f5] hover:bg-blue-600 focus:outline-none font-semibold rounded-full text-sm p-1.5 text-center transition-all"
        >
          <FiPlus className="w-5 h-5" />
        </Link>

        {props.filterButtonShow && (
          <button
            onClick={props.filterButtonOnClick}
            className="bg-[#0071f5] hover:bg-blue-600 rounded-full shadow-xl border border-gray-200 p-2 sm:p-[9px] ml-2 active:scale-90 transition-all"
          >
            <HiOutlineFilter className="w-4 h-4 2xl:w-5 2xl:h-5 text-white" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Select;
