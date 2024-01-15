"use client";
import React, { useEffect, useMemo } from "react";
import { MdAttachMoney } from "react-icons/md";
import { observer } from "mobx-react-lite";
import Layout from "@/components/layout/Dashboard";
import Modal from "@/components/Modal";
import Textarea from "@/components/html/Textarea";
import Select from "@/components/html/Select";
import Input from "@/components/html/Input";
import Table from "@/components/table/Table";
import Pagination from "@/components/table/Pagination";
import { productTitle } from "@/utils";
import { commonStore, sellStore, productStore } from "@/stores/useStore";

const DashboardSales = () => {
  const {
    sales,
    sellData,
    perPage,
    isLoading,
    searchText,
    filterData,
    showFilter,
    fuelConsumption,
    dieselPrice,
    handlePageChange,
    handlePageClick,
    setPerPage,
    setSearchText,
    setFilterData,
    searchSales,
    setSellData,
    clearSellData,
    createSell,
    loadSales,
    deleteSell,
    setShowFilter,
    loadValues,
    setFuelConsumption,
    setDieselPrice,
    updateValues,
  } = sellStore;
  const { products } = productStore;
  const { errorFields, successMessage, errorMessage } = commonStore;

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  useEffect(() => {
    loadValues();
  }, [loadValues]);

  const handleDeleteSell = (id) => {
    deleteSell(id);
  };

  const filteredSales = sales?.sales?.map(
    ({ _id, product, quantity, price, fuel_price, date, message }) => ({
      _id,
      product,
      quantity,
      price,
      fuel_price,
      date,
      message,
    })
  );

  const updatedProducts = useMemo(() => {
    return products.map((product) => ({
      ...product,
      name: productTitle(product),
    }));
  }, [products]);

  const handleInputChange = (name, value) => {
    let updatedData = { ...sellData };

    switch (name) {
      case "product":
        if (value === "") {
          clearSellData();
          return;
        }

        break;
      case "quantity":
        value = Number(value);

        const selectedProduct = products.find(
          (product) => product._id === sellData.product
        );

        updatedData.price = selectedProduct.sell_prices[value - 1];
        break;
      case "diesel_price":
        updatedData.fuel_price =
          (sellData.mileage / 100) * sellData.fuel_consumption * Number(value);
      case "fuel_consumption":
        updatedData.fuel_price =
          (sellData.mileage / 100) * Number(value) * sellData.diesel_price;
      case "mileage":
        updatedData.fuel_price =
          (Number(value) / 100) *
          sellData.fuel_consumption *
          sellData.diesel_price;
        break;
      case "price":
        value = Number(value);

        updatedData.price = sellData.quantity * value;
        break;
      default:
        break;
    }

    setSellData({ ...updatedData, [name]: value });
  };

  const modal = (
    <Modal
      isButton={true}
      errorFields={errorFields}
      saveBtnAction={createSell}
      openBtnText='Добави'
      title='Дoбави продажба'>
      <div className='space-y-3.5'>
        <Select
          items={updatedProducts}
          label='Избери продукт'
          value={sellData.product || ""}
          errorMessage={errorFields.product}
          onChange={(value) => handleInputChange("product", value)}
        />

        <Input
          type='text'
          label='Количество'
          value={sellData.quantity || ""}
          disabled={!sellData.product}
          errorMessage={errorFields.quantity}
          onChange={(value) => handleInputChange("quantity", value)}
        />

        <Input
          type='text'
          label='Цена'
          value={sellData.price || ""}
          disabled={!sellData.quantity}
          errorMessage={errorFields.price}
          onChange={(value) => handleInputChange("price", value)}
        />

        <div className='grid grid-cols-2 gap-3.5'>
          <Input
            type='text'
            label='Разход на 100км'
            value={sellData.fuel_consumption || ""}
            errorMessage={errorFields.fuel_consumption}
            onChange={(value) => handleInputChange("fuel_consumption", value)}
          />

          <Input
            type='text'
            label='Цена на дизела'
            value={sellData.diesel_price || ""}
            errorMessage={errorFields.diesel_price}
            onChange={(value) => handleInputChange("diesel_price", value)}
          />
        </div>

        <Input
          type='text'
          label='Изминати километри'
          value={sellData.mileage || ""}
          disabled={!sellData.diesel_price && !sellData.fuel_consumption}
          errorMessage={errorFields.mileage}
          onChange={(value) => handleInputChange("mileage", value)}
        />

        <Input
          type='text'
          label='Допълнителни разходи'
          value={sellData.additional_costs || ""}
          onChange={(value) => handleInputChange("additional_costs", value)}
        />

        <Input
          type='date'
          label='Дата'
          value={sellData.date || ""}
          onChange={(value) => handleInputChange("date", value)}
        />

        <Textarea
          label='Съобщение'
          value={sellData.message || ""}
          onChange={(value) => handleInputChange("message", value)}
        />

        <div className='grid grid-cols-2 gap-3.5'>
          <div className='bg-[#f4f4f5] p-5 text-slate-600 rounded-lg shadow-sm text-center font-semibold'>
            <div className='text-sm'>Продажна цена</div>

            <div>
              {sellData.price ? sellData.price.toFixed(2) + "лв." : "0.00лв."}
            </div>
          </div>

          <div className='bg-[#f4f4f5] p-5 text-slate-600 rounded-lg shadow-sm text-center font-semibold'>
            <div className='text-sm'>Разходи за гориво</div>

            <div>
              {sellData.fuel_price
                ? sellData.fuel_price.toFixed(2) + "лв."
                : "0.00лв."}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );

  return (
    <Layout title='Продажби'>
      <Modal
        title='Редактирай стойности'
        saveBtnAction={() => {
          return updateValues("65a551bbacc139606ddbb3ec", {
            diesel_price: dieselPrice,
            fuel_consumption: fuelConsumption,
          });
        }}
        openButton={
          <button
            className={`${
              showFilter ? "top-[22.6rem]" : "top-20"
            } text-white absolute top-20 right-3 sm:right-10 bg-[#0071f5] hover:bg-blue-600 focus:outline-none font-semibold rounded-full text-sm px-1.5 sm:px-4 2xl:px-6 py-1.5 2xl:py-2.5 text-center transition-all active:scale-90`}>
            <span className='hidden sm:block'>Стойности</span>

            <MdAttachMoney className='w-5 h-5 sm:hidden' />
          </button>
        }>
        <div className='border-b pb-6'>
          <div className='text-slate-800 font-semibold mb-2'>Константи</div>

          <div className='space-y-3.5'>
            <Input
              type='text'
              label='Цена на гориво'
              value={dieselPrice || ""}
              errorMessage={errorFields.diesel_price}
              onChange={(value) => setDieselPrice(value)}
            />
            <Input
              type='text'
              label='Разход на 100км.'
              value={fuelConsumption || ""}
              errorMessage={errorFields.fuel_consumption}
              onChange={(value) => setFuelConsumption(value)}
            />
          </div>
        </div>
      </Modal>

      <div className='min-h-screen 2xl:px-10'>
        <Table
          title='Продажби'
          data={filteredSales}
          columns={["продукт", "количество", "цена", "гориво", "дата"]}
          delete={handleDeleteSell}
          perPage={perPage}
          filterSearchOnClick={searchSales}
          // clearFilterData={}
          filterData={filterData}
          showFilter={showFilter}
          setShowFilter={setShowFilter}
          setFilterData={setFilterData}
          totalPages={sales.pagination?.total_pages}
          isLoading={isLoading}
          setPerPage={setPerPage}
          searchBarButton={modal}
          searchBarPlaceholder='име на продукт'
          searchBarValue={searchText}
          setSearchBarText={setSearchText}
          filterSection={true}
          //editButtonLink="/dashboard/ads/edit/"
        >
          <Pagination
            isLoading={isLoading}
            currentPage={sales.pagination?.current_page}
            totalPages={sales.pagination?.total_pages}
            totalItems={sales.pagination?.total_results}
            perPage={sales.pagination?.per_page}
            handlePrevPage={handlePageChange}
            handleNextPage={() => handlePageChange("next")}
            handlePageClick={(pageNumber) => {
              handlePageClick(pageNumber);
            }}
          />
        </Table>
      </div>
    </Layout>
  );
};

export default observer(DashboardSales);
