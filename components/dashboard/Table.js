"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Spinner } from "@heroui/react";
import { formatCurrency } from "@/utils";
import { productStore } from "@/stores/useStore";

const Table = (props) => {
  const { isLoading } = productStore;
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  useEffect(() => {
    const storedUserRole = localStorage.getItem("userRole");
    setIsUserAdmin(
      storedUserRole === "Admin" || storedUserRole === "Super Admin"
    );
  }, []);

  const renderCellValue = (key, value) => {
    switch (key) {
      case "carton":
      case "availability":
        return `${value} бр.`;
      case "price":
        return `${formatCurrency(value, 2)}`;
      default:
        return value;
    }
  };

  const bottleTotals = props.data?.bottles?.reduce(
    (acc, row) => {
      acc.carton += parseFloat(row.carton) || 0;
      acc.availability += parseFloat(row.availability) || 0;
      acc.price += parseFloat(row.price) || 0;
      return acc;
    },
    { carton: 0, availability: 0, price: 0 }
  );

  const vapeTotals = props.data?.vapes?.reduce(
    (acc, row) => {
      acc.carton += parseFloat(row.carton) || 0;
      acc.availability += parseFloat(row.availability) || 0;
      acc.price += parseFloat(row.price) || 0;
      return acc;
    },
    { carton: 0, availability: 0, price: 0 }
  );

  const renderRows = (rows) =>
    rows?.map((row, rowIndex) => (
      <tr key={rowIndex}>
        {Object.entries(row).map(
          ([key, value], cellIndex) =>
            key !== "image_url" && (
              <td
                className='py-2.5 px-5 border-b border-slate-200 whitespace-nowrap'
                key={cellIndex}>
                {key === "name" ? (
                  <div className='flex items-center gap-2.5'>
                    <Image
                      src={row.image_url}
                      className='size-10 border object-cover object-center rounded-full shadow border-gray-100'
                      alt={`Picture of ${value}`}
                      width={100}
                      height={100}
                    />
                    {value}
                  </div>
                ) : (
                  renderCellValue(key, value)
                )}
              </td>
            )
        )}
      </tr>
    ));

  const renderSubtotalRow = (totals) => (
    <tr className='border-b border-slate-200 bg-slate-50 whitespace-nowrap'>
      <td className='py-3 px-5'>Междинна сума:</td>
      <td className='px-5'>{totals?.carton.toFixed(1)} бр.</td>
      <td className='px-5'>{totals?.availability} бр.</td>
      {isUserAdmin && (
        <td className='px-5'>{formatCurrency(totals?.price, 2)}</td>
      )}
    </tr>
  );

  const totalPrice = (bottleTotals?.price || 0) + (vapeTotals?.price || 0);

  return (
    <div className='col-span-full xl:col-span-8 bg-white rounded-md h-full shadow-md'>
      <div className='px-5 py-4 border-b border-slate-100'>
        <div className='text-xl font-semibold leading-none text-slate-700'>
          {props.title}
        </div>
      </div>

      <div className='p-3'>
        <div className='overflow-x-auto'>
          {isLoading ? (
            <div className='w-full h-[28rem] center-element'>
              <Spinner classNames={{ wrapper: "w-20 h-20" }} />
            </div>
          ) : !props.data?.bottles?.length && !props.data?.vapes?.length ? (
            <p className='h-[28rem] w-full center-element font-semibold text-slate-700 text-center'>
              Няма намерени данни
            </p>
          ) : (
            <table className='table-auto w-full overflow-x-auto'>
              <thead className='text-xs uppercase text-slate-400 bg-slate-50 rounded-sm'>
                <tr>
                  {props.columns.map((column, index) => (
                    <th
                      key={index}
                      className='py-2.5 px-5 text-left'>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className='text-sm font-semibold text-slate-600'>
                {/* Секция Бутилки */}
                {props.data?.bottles?.length > 0 && (
                  <>
                    <tr className='bg-blue-50 border-y border-slate-200'>
                      <td
                        colSpan={props.columns.length}
                        className='py-3 px-5 font-bold'>
                        Бутилки
                      </td>
                    </tr>
                    {renderRows(props.data.bottles)}
                    {renderSubtotalRow(bottleTotals)}
                  </>
                )}

                {props.data?.vapes?.length > 0 && (
                  <>
                    <tr className='bg-blue-50 border-y border-slate-200'>
                      <td
                        colSpan={props.columns.length}
                        className='py-3 px-5 font-bold'>
                        Вейпове
                      </td>
                    </tr>
                    {renderRows(props.data.vapes)}
                    {renderSubtotalRow(vapeTotals)}
                  </>
                )}

                {isUserAdmin && (
                  <tr className='bg-slate-600 text-white font-bold'>
                    <td className='py-3 px-5'>ОБЩО:</td>
                    <td
                      colSpan={props.columns.length - 2}
                      className='py-3 px-5'
                    />
                    <td className='py-3 px-5'>
                      {formatCurrency(totalPrice, 2)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Table;
