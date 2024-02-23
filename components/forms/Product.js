import { BsTrash3 } from "react-icons/bs";
import { HiOutlinePlus } from "react-icons/hi2";
import { Spinner } from "@nextui-org/react";
import Input from "@/components/html/Input";
import { formatCurrency } from "@/utils";

const ProductForm = (props) => {
  if (Object.keys(props.data).length === 0) {
    return (
      <div className='py-32 mx-auto'>
        <Spinner classNames={{ wrapper: "w-20 h-20" }} />
      </div>
    );
  }
  return (
    <>
      <div className='border-b pb-6'>
        <div className='text-slate-800 font-semibold mb-2'>
          Цена за зареждане
        </div>

        <Input
          type='text'
          label='Цена на зареждане'
          value={props.data.price || ""}
          errorMessage={props.errorFields.price}
          onChange={(value) => props.handleFieldChange("price", value)}
        />
      </div>

      <div className='border-b pb-6'>
        <div className='text-slate-800 font-semibold mb-2'>Наличност</div>

        <Input
          type='text'
          label='Начличност на проддукта'
          value={props.data.availability || "0"}
          errorMessage={props.errorFields.availability}
          onChange={(value) => props.handleFieldChange("availability", value)}
        />
      </div>

      <div className='pt-1 space-y-2'>
        <div className='text-slate-800 font-semibold'>Цена за продажба</div>

        <div className='space-y-3.5'>
          {props.data.sell_prices?.map((price, index) => (
            <div
              key={index}
              className='flex items-center'>
              {props.data.sell_prices.length > 1 && (
                <button
                  className='rounded-full p-2 bg-white border hover:bg-slate-50 transition-all active:scale-95 mr-2'
                  onClick={() => props.removeData(index)}>
                  <BsTrash3 />
                </button>
              )}

              <div className='flex items-center space-x-2.5 w-full'>
                <Input
                  type='text'
                  label={`Цена за ${index + 1}бр.`}
                  value={price || ""}
                  errorMessage={
                    props.errorFields.sell_prices?.positions.includes(index) &&
                    props.errorFields.sell_prices?.message
                  }
                  onChange={(value) =>
                    props.handleFieldChange("sell_prices", value, index)
                  }
                />

                <div className='size-12 bg-[#f4f4f5] rounded-lg center-element text-xs px-2 text-slate-800'>
                  {formatCurrency((index + 1) * props.data.price, 0)}лв.
                </div>
              </div>
            </div>
          ))}

          <div className='center-element mt-4 w-full'>
            <button
              className='rounded-full p-2 bg-white border hover:bg-slate-50 transition-all active:scale-95'
              onClick={props.addData}>
              <HiOutlinePlus />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductForm;
