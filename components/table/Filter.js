import { motion, AnimatePresence } from "framer-motion";
import { HiMiniXMark, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { GrPowerReset } from "react-icons/gr";
import { objectHasValues } from "@/utils";
import { usePathname } from "next/navigation";
import OrderFilter from "@/components/table/filters/OrderFilter";

function Filter(props) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {props.show && (
        <motion.div
          className="bg-white rounded-lg shadow border border-gray-100 w-full"
          key="content"
          initial="collapsed"
          animate="open"
          exit="collapsed"
          variants={{
            open: { opacity: 1, height: "auto" },
            collapsed: { opacity: 0, height: 0 },
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          style={{ overflow: "hidden" }}
        >
          <div className="flex items-center justify-between border-b-2 text-slate-700">
            <div className="p-4 text-lg font-semibold leading-tight">
              Подробно търсене
            </div>

            <button
              onClick={props.close}
              className="m-4 transition-all active:scale-90 hover:text-slate-500"
            >
              <HiMiniXMark className="w-6 h-6 stroke-1" />
            </button>
          </div>

          <div className="sm:grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 pt-4 pb-6">
            {pathname.includes("/orders") && (
              <OrderFilter data={props.data} setData={props.setData} />
            )}

            <div className="px-3 sm:pr-2 md:px-3 lg:px-4 col-span-1 mt-1 sm:mt-4 flex items-center space-x-4">
              <button
                type="button"
                onClick={props.clearFilterData}
                disabled={objectHasValues(props.data)}
                className={`w-1/2 sm:w-auto  ${
                  objectHasValues(props.data)
                    ? "opacity-60"
                    : "hover:text-[#0071f5] active:scale-95 hover:border-blue-100"
                } text-slate-700 border border-gray-300  focus:outline-none font-semibold rounded-full px-4 2xl:px-6 h-11 mt-7 text-center transition-all flex items-center justify-center`}
              >
                <GrPowerReset className="h-5 w-5 sm:mt-0.5 mr-1" />
                Изчисти
              </button>

              <button
                type="button"
                disabled={objectHasValues(props.data)}
                onClick={props.searchOnClick}
                className={`w-1/2 sm:w-auto ${
                  objectHasValues(props.data)
                    ? "bg-opacity-60"
                    : "hover:bg-blue-600 active:scale-95"
                } text-white bg-[#0071f5] focus:outline-none font-semibold rounded-full px-6 2xl:px-8 h-11 mt-7 text-center transition-all flex items-center justify-center`}
              >
                <HiOutlineMagnifyingGlass className="h-5 w-5 sm:mt-[3px] mr-1" />
                Търси
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Filter;
