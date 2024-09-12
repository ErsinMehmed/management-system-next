"use client";
import React, { useEffect, useMemo } from "react";
import { MdAttachMoney } from "react-icons/md";
import { observer } from "mobx-react-lite";
import Layout from "@/components/layout/Dashboard";
import Modal from "@/components/Modal";
import Input from "@/components/html/Input";
import Table from "@/components/table/Table";
import Pagination from "@/components/table/Pagination";
import SellForm from "@/components/forms/Sell";
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

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  useEffect(() => {
    loadValues();
  }, [loadValues]);

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
      isSellCreated={isSellCreated}
      openBtnText="Добави"
      title="Дoбави продажба"
    >
      <SellForm
        data={sellData}
        errorFields={errorFields}
        updatedProducts={updatedProducts}
        handleFieldChange={handleFieldChange}
      />
    </Modal>
  );

  return (
    <Layout title="Продажби">
      <Modal
        title="Редактирай стойности"
        saveBtnAction={() => {
          return updateValues("65a551bbacc139606ddbb3ec", {
            diesel_price: dieselPrice,
            fuel_consumption: fuelConsumption,
          });
        }}
        openButton={
          <button className="text-white absolute -top-[4.1rem] sm:-top-[4.6rem] right-3 sm:right-10 bg-[#0071f5] hover:bg-blue-600 focus:outline-none font-semibold rounded-full text-sm px-1.5 sm:px-4 2xl:px-6 py-1.5 2xl:py-2.5 text-center transition-all active:scale-90">
            <span className="hidden sm:block">Стойности</span>

            <MdAttachMoney className="w-5 h-5 sm:hidden" />
          </button>
        }
      >
        <div className="border-b pb-6">
          <div className="text-slate-800 font-semibold mb-2">Константи</div>

          <div className="space-y-3.5">
            <Input
              type="text"
              label="Цена на гориво"
              value={dieselPrice || ""}
              errorMessage={errorFields.diesel_price}
              onChange={(value) => setDieselPrice(value)}
            />

            <Input
              type="text"
              label="Разход на 100км."
              value={fuelConsumption || ""}
              errorMessage={errorFields.fuel_consumption}
              onChange={(value) => setFuelConsumption(value)}
            />
          </div>
        </div>
      </Modal>

      <div className="min-h-screen 2xl:px-10">
        <Table
          title="Продажби"
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
          searchBarButton={modal}
          searchBarPlaceholder="име на продукт"
          searchBarValue={searchText}
          setSearchBarText={setSearchText}
          filterSection={true}
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
