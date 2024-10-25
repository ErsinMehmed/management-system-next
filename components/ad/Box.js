"use client";
import moment from "moment";
import Image from "next/image";
import InstagramImg from "@/public/images/instagram-logo.png";
import FacebookImg from "@/public/images/facebook-logo.png";
import { FaRegTrashAlt } from "react-icons/fa";
import { formatCurrency } from "@/utils";

const Box = (props) => {
  return (
    <div className="w-full relative bg-white shadow-md rounded-md py-2 px-4 flex items-center">
      <Image
        src={props.data.platform === "Facebook" ? FacebookImg : InstagramImg}
        alt="Social photo"
        className="size-20 object-cover"
        width={30}
        height={30}
        quality={100}
      />

      <div className="mt-4 pl-3.5 mb-3 text-slate-700">
        <p className="text-lg font-semibold">{props.data.platform}</p>
        <p className="text-sm font-medium">
          Сума: {formatCurrency(props.data.amount, 2)}
        </p>
        <p className="text-sm font-medium">
          {moment(props.data.date).format("DD.MM.YYYY")}г.
        </p>
      </div>

      <button
        onClick={() => props.deleteAd(props.data._id)}
        className="absolute top-4 right-4 bg-red-500 text-white rounded-xl focus:outline-none p-2.5 transition-all active:scale-95"
      >
        <FaRegTrashAlt />
      </button>
    </div>
  );
};

export default Box;
