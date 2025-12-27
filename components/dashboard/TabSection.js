import {
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@heroui/react";
import { formatCurrency } from "@/utils";

const TabSection = (props) => {
  const filteredData = props.data[`${props.kind}_by_products`]?.filter(
    (item) => item.category === props.category
  );

  const totalAmount = filteredData?.reduce(
    (accumulator, stat) => accumulator + stat[props.totalKey],
    0
  );

  const getProductName = (item) => {
    switch (props.category) {
      case "Бутилки":
        return `${item.name} ${item.weight}гр.`;
      case "Балони":
        return `${item.name} ${item.count}бр.`;
      case "Вейпове":
        return `${item.name} ${item.puffs}k`;
      default:
        return item.name;
    }
  };

  const totalQuantity = filteredData?.reduce(
    (accumulator, item) => accumulator + item.quantity,
    0
  );

  return (
    <div className='bg-gray-50 rounded-lg'>
      {filteredData?.length > 0 ? (
        <>
          {filteredData?.map((item, index) => (
            <dl
              key={index}
              className={`grid grid-cols-3 ${
                index > 0 && "border-t border-slate-200"
              } py-2.5 px-3 text-sm`}>
              <dt className='text-gray-500 font-semibold'>
                <Tooltip
                  content={formatCurrency(
                    item[props.totalKey] / item.quantity,
                    2
                  )}
                  placement='bottom'>
                  <button className='hidden sm:block'>
                    {getProductName(item)}
                  </button>
                </Tooltip>

                <Popover placement='bottom'>
                  <PopoverTrigger>
                    <button className='sm:hidden'>
                      {getProductName(item)}
                    </button>
                  </PopoverTrigger>

                  <PopoverContent>
                    {formatCurrency(item[props.totalKey] / item.quantity, 2)}
                  </PopoverContent>
                </Popover>
              </dt>

              <dt className='text-gray-500 font-semibold text-center'>
                {item.quantity} бр.
              </dt>

              <dd className='bg-gray-100 w-fit h-fit text-gray-700 px-2.5 py-1 rounded-md font-medium ml-auto'>
                {formatCurrency(item[props.totalKey], 2)}
              </dd>
            </dl>
          ))}

          {filteredData?.length > 1 && (
            <dl className='grid grid-cols-3 gap-x-8 py-2.5 px-3 text-sm border-t border-slate-200'>
              {props.category === "Бутилки" && (
                <dt className='bg-gray-100 text-center col-start-2 text-gray-700 px-2.5 py-1 rounded-md font-semibold'>
                  {totalQuantity} бр.
                </dt>
              )}

              <dt
                className={`${
                  props.category !== "Бутилки" && "col-start-3"
                } bg-gray-100 text-center text-gray-700 px-2.5 py-1 rounded-md font-semibold`}>
                {formatCurrency(totalAmount, 2)}
              </dt>
            </dl>
          )}
        </>
      ) : (
        <div className='text-gray-500 text-center py-3 font-semibold text-sm'>
          Няма налични данни
        </div>
      )}
    </div>
  );
};

export default TabSection;
