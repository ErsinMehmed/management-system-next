"use client";
import Image from "next/image";
import { productTitle, getProductImage } from "@/utils";

const Box = (props) => {
  return (
    <div
      onClick={props.onClick}
      className='relative py-2.5 rounded-lg bg-white shadow-md duration-300 hover:shadow-xl border border-transparent hover:border-gray-200 cursor-pointer'>
      <Image
        src={getProductImage(
          props.data.name,
          props.data?.weight,
          props.data.flavor
        )}
        className='sm:h-56 xl:h-64 w-full object-cover object-center border-b px-2.5'
        alt={`Picture of ${props.data.name}`}
        width={"100%"}
        height={"100%"}
      />

      <div className='absolute top-4 right-4 sm:top-2.5 sm:right-2.5 rounded-lg font-semibold sm:text-sm bg-blue-400 text-white px-2 py-0.5'>
        {props.data.category.name}
      </div>

      <div className='p-3.5'>
        <h2 className='mb-2 text-lg text-gray-800 font-semibold'>
          {productTitle(props.data)}
        </h2>

        <div className='mb-2 text-base text-gray-700 flex'>
          Наличност:{" "}
          <div className='bg-blue-400 text-white h-6 w-10 ml-2 mr-1 rounded flex items-center justify-center font-semibold shadow-md'>
            {props.data.availability}
          </div>{" "}
          бр.
        </div>

        <div className='flex items-center'>
          <div className='mr-2 text-lg font-semibold text-gray-900'>
            {props.data.price?.toFixed(2)}лв.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Box;
