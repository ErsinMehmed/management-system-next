"use client";
import React, { useEffect, useMemo, useState } from "react";
import { MdAttachMoney } from "react-icons/md";
import { observer } from "mobx-react-lite";
import Layout from "@/components/layout/Dashboard";
import Modal from "@/components/Modal";
import Input from "@/components/html/Input";
import Table from "@/components/table/Table";
import Pagination from "@/components/table/Pagination";
import SellForm from "@/components/forms/Sell";
import { FiPlus } from "react-icons/fi";
import { productTitle } from "@/utils";
import { commonStore, sellStore, productStore } from "@/stores/useStore";

const SalesClient = ({ initialData }) => {
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
    orderColumn,
    isSellCreated,
    handlePageChange,
    handlePageClick,
    setPerPage,
    setOrderColumn,
    clearFilterData,
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
  const [isAddOpen, setIsAddOpen] = useState(false);
  const onAddOpen = () => setIsAddOpen(true);
  const onAddOpenChange = (open) => setIsAddOpen(open);
  const [isValuesOpen, setIsValuesOpen] = useState(false);
  const onValuesOpen = () => setIsValuesOpen(true);
  const onValuesOpenChange = (open) => setIsValuesOpen(open);

  useEffect(() => {
    if (initialData) {
      sellStore.hydrateSales(initialData.sales, initialData.values);
      return;
    }
    loadSales();
  }, []);

  useEffect(() => {
    if (initialData) return;
    loadValues();
  }, []);

  const handleDeleteSell = (id) => {
    deleteSell(id);
  };

  const filteredSales = sales?.items?.map(
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
    return products
      .filter((product) => !product.hidden)
      .map((product) => ({
        ...product,
        name: productTitle(product),
      }));
  }, [products]);

  const handleFieldChange = (name, value) => {
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
        break;
      case "fuel_consumption":
        updatedData.fuel_price =
          (sellData.mileage / 100) * Number(value) * sellData.diesel_price;
        break;
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

  const addButton = (
    <button
      type="button"
      className="text-white bg-[#0071f5] hover:bg-blue-600 focus:outline-none font-semibold rounded-full text-sm px-1.5 sm:px-4 2xl:px-6 py-1.5 2xl:py-2.5 text-center transition-all active:scale-90"
      onClick={onAddOpen}>
      <span className="hidden sm:block">Добави</span>
      <FiPlus className="w-5 h-5 sm:hidden" />
    </button>
  );

  return (
    <Layout title='Продажби'>
      <button
        onClick={onValuesOpen}
        className='text-white absolute -top-[3.3rem] sm:-top-[3.1rem] right-7 sm:right-18 2xl:right-96 bg-[#0071f5] hover:bg-blue-600 focus:outline-none font-semibold rounded-full text-sm px-1.5 sm:px-4 2xl:px-6 py-1.5 2xl:py-2.5 text-center transition-all active:scale-90'>
        <span className='hidden sm:block'>Стойности</span>
        <MdAttachMoney className='w-5 h-5 sm:hidden' />
      </button>

      <div className='min-h-screen 2xl:px-10'>
        <Table
          title='Продажби'
          data={filteredSales}
          columns={["продукт", "количество", "цена", "гориво", "дата"]}
          delete={handleDeleteSell}
          perPage={perPage}
          orderColumn={orderColumn}
          setOrderColumn={setOrderColumn}
          filterSearchOnClick={searchSales}
          clearFilterData={clearFilterData}
          filterData={filterData}
          showFilter={showFilter}
          setShowFilter={setShowFilter}
          setFilterData={setFilterData}
          totalPages={sales.pagination?.total_pages}
          isLoading={isLoading}
          setPerPage={setPerPage}
          searchBarButton={addButton}
          searchBarPlaceholder='име на продукт'
          searchBarValue={searchText}
          setSearchBarText={setSearchText}
          filterSection={true}>
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

      <Modal
        isOpen={isAddOpen}
        onOpenChange={onAddOpenChange}
        title='Дoбави продажба'
        isLoading={isSellCreated}
        onSave={createSell}>
        <SellForm
          data={sellData}
          errorFields={errorFields}
          updatedProducts={updatedProducts}
          handleFieldChange={handleFieldChange}
        />
      </Modal>

      <Modal
        isOpen={isValuesOpen}
        onOpenChange={onValuesOpenChange}
        title='Редактирай стойности'
        onSave={() => {
          return updateValues({
            diesel_price: dieselPrice,
            fuel_consumption: fuelConsumption,
          });
        }}>
        <div className='border-b border-slate-200 pb-6'>
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
    </Layout>
  );
};

export default observer(SalesClient);
