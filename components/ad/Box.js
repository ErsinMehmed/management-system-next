"use client";
import moment from "moment";
import Image from "next/image";
import InstagramImg from "@/public/images/instagram-logo.png";
import FacebookImg from "@/public/images/facebook-logo.png";

const Box = (props) => {
  return (
    <div className='w-full sm:max-w-sm bg-white shadow-md rounded-md py-2 px-4 flex items-center'>
      <Image
        src={FacebookImg}
        alt='Social photo'
        className='size-20 object-cover'
        width={30}
        height={30}
        quality={100}
      />

      <div className='mt-4 pl-3.5 mb-3 text-slate-700'>
        <p className='text-lg font-semibold'>Facebook</p>
        <p className='text-sm font-medium'>Сума: 340.00лв.</p>
        <p className='text-sm font-medium'>20.01.2024</p>
      </div>
    </div>
  );
};

export default Box;
