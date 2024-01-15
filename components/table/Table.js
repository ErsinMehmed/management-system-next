import React, { useState } from "react";
import { MdDelete } from "react-icons/md";
import { FaCheck } from "react-icons/fa6";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@nextui-org/react";
import moment from "moment";
import { productTitle } from "@/utils";
import { perPageResult } from "@/data";
import SearchBar from "./SearchBar";
import Filter from "./Filter";
import Loader from "./Loader";
import Select from "./Select";

const Table = (props) => {
  const [rowId, setRowId] = useState(null);

  const toggleFilterSection = () => {
    props.setShowFilter(!props.showFilter);
  };

  const handleDelete = (id) => {
    props.delete(id);
  };

  const handleInputChange = (value) => {
    props.setSearchBarText(value);
  };

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const renderCellValue = (key, value) => {
    switch (key) {
      case "product":
        return productTitle(value);
      case "quantity":
        return `${value} бр.`;
      case "mileage":
        return `${value} км.`;
      case "date":
        return moment(value).format("DD.MM.YYYY");
      case "fuel_price":
      case "price":
      case "total_amount":
        return `${value?.toFixed(2)} лв.`;
      default:
        return value;
    }
  };

  return (
    <div className='sm:container sm:mx-auto sm:px-8 2xl:px-0'>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1 text-2xl mt-3'>
                Изтрий обявата
              </ModalHeader>
              <ModalBody>
                <div>Сигурни ли сте, че искате да изтриете обявата ?</div>

                <div className='flex flex-row mt-3 mb-4 space-x-3 justify-evenly'>
                  <button
                    onClick={() => {
                      onClose();
                      handleDelete(rowId);
                    }}
                    className='w-full py-2.5 text-sm font-semibold text-center text-white transition-all bg-red-600 border border-red-600 rounded-lg hover:bg-red-500 active:scale-95'>
                    Изтрий
                  </button>

                  <button
                    onClick={onClose}
                    className='w-full py-2.5 text-sm font-semibold text-center text-gray-700 transition-all bg-white border border-gray-200 rounded-lg hover:bg-gray-100 active:scale-95'>
                    Откажи
                  </button>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <SearchBar
        isLoading={props.isLoading}
        placeholder={props.searchBarPlaceholder}
        value={props.searchBarValue}
        button={props.searchBarButton}
        onChange={(value) => handleInputChange(value)}
        filterButtonOnClick={toggleFilterSection}
        disabled={props.showFilter}
        filterButtonShow={props.filterSection}
      />

      {props.filterSection && (
        <Filter
          show={props.showFilter}
          close={toggleFilterSection}
          clearFilterData={props.clearFilterData}
          searchOnClick={props.filterSearchOnClick}
          data={props.filterData}
          setData={props.setFilterData}
        />
      )}

      <div
        className={`bg-white p-4 rounded-t-lg shadow border border-gray-100 ${
          props.showFilter ? "mt-4" : ""
        }`}>
        {props.isLoading ? (
          <>
            <div className='h-1.5 bg-gray-200 rounded-full w-16 mb-2'></div>
            <div className='h-1.5 bg-gray-200 rounded-full w-20'></div>
          </>
        ) : (
          <h2 className='text-lg font-semibold leading-tight'>{props.title}</h2>
        )}
      </div>
      <div className='-mx-4 sm:-mx-8 px-4 sm:px-8 pb-4 overflow-x-auto'>
        <div className='inline-block min-w-full shadow rounded-b-lg overflow-hidden table-fixed'>
          <table className='min-w-full leading-normal bg-white'>
            {props.isLoading ? (
              <Loader
                numberOfRows={props.perPage}
                cellCount={props.columns.length + 1}
                numberOfColumn={props.columns.length + 1}
              />
            ) : (
              <>
                <thead>
                  <tr>
                    {props.columns.map((column, index) => (
                      <th
                        className='px-4 py-3.5 border-b-2 border-[#ebf4ff] bg-[#ebf4ff] text-left text-sm font-bold text-slate-700 uppercase tracking-wider'
                        key={index}>
                        {column}
                      </th>
                    ))}

                    <th className='px-5 text-center py-3.5 border-b-2 border-[#ebf4ff] bg-[#ebf4ff] text-sm font-bold text-slate-800 uppercase tracking-wider'>
                      Действия
                    </th>
                  </tr>
                </thead>

                <tbody className='bg-white w-full'>
                  {props.data?.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.entries(row).map(
                        ([key, value], cellIndex) =>
                          key !== "_id" &&
                          key !== "message" && (
                            <td
                              className={`${
                                cellIndex === 1
                                  ? "font-semibold text-slate-800"
                                  : "text-slate-600"
                              } px-4 py-4 border-b border-[#ebf4ff] text-sm whitespace-nowrap`}
                              key={cellIndex}>
                              {renderCellValue(key, value)}
                            </td>
                          )
                      )}

                      <td className='pl-4 py-1.5 border-b border-[#ebf4ff] text-center'>
                        <div className='grid grid-cols-2 gap-2 lg:gap-0 w-24 mx-auto'>
                          {props.title === "Заявки" && (
                            <button
                              type='button'
                              className='text-white w-fit bg-green-600 hover:bg-green-700 focus:outline-none font-medium rounded-lg text-sm p-2.5 text-center transition-all active:scale-90'>
                              <FaCheck className='w-4 h-4' />
                            </button>
                          )}

                          <button
                            type='button'
                            onClick={() => {
                              setRowId(row._id);
                              onOpen();
                            }}
                            className='text-white w-fit bg-red-600 hover:bg-red-700 focus:outline-none font-medium rounded-lg text-sm p-2.5 text-center transition-all active:scale-90'>
                            <MdDelete className='w-4 h-4' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
          </table>

          <div className='px-5 py-4 bg-white border-t flex  items-center justify-between'>
            <div className='w-32 h-0 -mt-10'>
              {props.isLoading ? (
                <div className='bg-[#f4f4f5] w-14 h-8 rounded-lg px-2 pt-2 mt-1'>
                  <div className='h-1 animate-pulse bg-gray-200 rounded-full w-10/12 mb-2'></div>
                  <div className='h-1 animate-pulse bg-gray-200 rounded-full'></div>
                </div>
              ) : (
                <Select
                  options={perPageResult}
                  value={props.perPage}
                  onChange={(event) => props.setPerPage(event)}
                />
              )}
            </div>

            {props.children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;
