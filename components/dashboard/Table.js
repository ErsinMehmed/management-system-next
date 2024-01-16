"use client";
import { getProductImage } from "@/utils";

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

  return (
    <div className='col-span-full xl:col-span-8 bg-white rounded-md shadow-md h-[36.3rem]'>
      <header className='px-5 py-4 border-b border-slate-100'>
        <div className='text-xl font-bold leading-none text-slate-800'>
          {props.title}
        </div>
      </header>

      <div className='p-3'>
        <div className='overflow-x-auto'>
          <table className='table-auto w-full'>
            <thead className='text-xs uppercase text-slate-400 bg-slate-50 rounded-sm'>
              <tr>
                {props.columns.map((column, index) => (
                  <th
                    key={index}
                    className='p-2.5 text-left'>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className='text-sm font-semibold divide-y text-slate-700 divide-slate-100'>
              {props.data?.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.entries(row).map(([key, value], cellIndex) => (
                    <td
                      className='p-2.5 border-b'
                      key={cellIndex}>
                      {renderCellValue(key, value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Table;
