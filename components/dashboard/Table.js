"use client";
import Image from "next/image";
import { Spinner } from "@nextui-org/react";
import { getProductImageByWeight } from "@/utils";

const Table = (props) => {
  const renderCellValue = (key, value) => {
    switch (key) {
      case "carton":
      case "availability":
        return `${value} бр.`;
      case "price":
        return `${value?.toFixed(2)} лв.`;
      default:
        return value;
    }
  };

  const totals = props.data?.reduce(
    (acc, row) => {
      acc.carton += parseFloat(row.carton) || 0;
      acc.availability += parseFloat(row.availability) || 0;
      acc.price += parseFloat(row.price) || 0;
      return acc;
    },
    { carton: 0, availability: 0, price: 0 }
  );

  return (
    <div className="col-span-full xl:col-span-8 bg-white rounded-md h-full shadow-md">
      <header className="px-5 py-4 border-b border-slate-100">
        <div className="text-xl font-bold leading-none text-slate-800">
          {props.title}
        </div>
      </header>

      <div className="p-3">
        <div className="overflow-x-auto">
          {Object.keys(props.data).length === 0 ? (
            <div className="w-full h-[28rem] center-element">
              <Spinner classNames={{ wrapper: "w-20 h-20" }} />
            </div>
          ) : (
            <table className="table-auto w-full overflow-x-auto">
              <thead className="text-xs uppercase text-slate-400 bg-slate-50 rounded-sm">
                <tr>
                  {props.columns.map((column, index) => (
                    <th key={index} className="py-2.5 px-5 text-left">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="text-sm font-semibold">
                {props.data?.map((row, rowIndex) => (
                  <tr key={rowIndex} className="text-slate-600">
                    {Object.entries(row).map(([key, value], cellIndex) =>
                      key === "name" ? (
                        <td
                          className="py-2.5 px-5 border-b whitespace-nowrap"
                          key={cellIndex}
                        >
                          <div className="flex items-center gap-2.5">
                            <Image
                              src={getProductImageByWeight(value)}
                              className="size-10 border object-cover object-center rounded-full shadow border-gray-100"
                              alt={`Picture of ${value}`}
                              width={"100%"}
                              height={"100%"}
                            />

                            {value}
                          </div>
                        </td>
                      ) : (
                        <td
                          className="py-2.5 px-5 border-b whitespace-nowrap"
                          key={cellIndex}
                        >
                          {renderCellValue(key, value)}
                        </td>
                      )
                    )}
                  </tr>
                ))}

                <tr>
                  <td className="py-3 px-5 border-b whitespace-nowrap">
                    ОБЩО:
                  </td>
                  <td className="py-3 px-5 border-b whitespace-nowrap">
                    {totals.carton.toFixed(1)} бр.
                  </td>
                  <td className="py-3 px-5 border-b whitespace-nowrap">
                    {totals.availability} бр.
                  </td>
                  <td className="py-3 px-5 border-b whitespace-nowrap">
                    {totals.price.toFixed(2)} лв.
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Table;
