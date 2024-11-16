"use client";
import React, { useEffect, useMemo } from "react";
import { MdAttachMoney } from "react-icons/md";
import { observer } from "mobx-react-lite";
import Layout from "@/components/layout/Dashboard";
import Modal from "@/components/Modal";
import Input from "@/components/html/Input";
import Table from "@/components/table/Table";
import Pagination from "@/components/table/Pagination";
import IncomeForm from "@/components/forms/Income";
import { productTitle } from "@/utils";
import { commonStore, incomeStore, userStore } from "@/stores/useStore";

const DashboardIncomes = () => {
  const {
    allIcomes,
    perPage,
    isLoading,
    searchText,
    filterData,
    showFilter,
    orderColumn,
    handlePageChange,
    handlePageClick,
    setPerPage,
    setOrderColumn,
    setSearchText,
    setFilterData,
    loadAllIncomes,
    setShowFilter,
  } = incomeStore;
  const { disributors, loadDisributors } = userStore;
  const { errorFields, successMessage, errorMessage } = commonStore;

  useEffect(() => {
    loadAllIncomes();
    loadDisributors();
  }, []);

  const filteredAllIcomes = allIcomes?.items?.map(
    ({ _id, amount, message }) => ({
      _id,
      text: message,
      amount: amount + " лв.",
    })
  );

  //   const handleDeleteSell = (id) => {
  //     deleteSell(id);
  //   };

  //   const handleFieldChange = (name, value) => {
  //     let updatedData = { ...sellData };

  //     switch (name) {
  //       case "product":
  //         if (value === "") {
  //           clearSellData();
  //           return;
  //         }

  //         break;
  //       case "quantity":
  //         value = Number(value);

  //         const selectedProduct = products.find(
  //           (product) => product._id === sellData.product
  //         );

  //         updatedData.price = selectedProduct.sell_prices[value - 1];
  //         break;
  //       case "diesel_price":
  //         updatedData.fuel_price =
  //           (sellData.mileage / 100) * sellData.fuel_consumption * Number(value);
  //       case "fuel_consumption":
  //         updatedData.fuel_price =
  //           (sellData.mileage / 100) * Number(value) * sellData.diesel_price;
  //       case "mileage":
  //         updatedData.fuel_price =
  //           (Number(value) / 100) *
  //           sellData.fuel_consumption *
  //           sellData.diesel_price;
  //         break;
  //       case "price":
  //         value = Number(value);

  //         updatedData.price = sellData.quantity * value;
  //         break;
  //       default:
  //         break;
  //     }

  //     setSellData({ ...updatedData, [name]: value });
  //   };

  const modal = (
    <Modal
      isButton={true}
      // errorFields={errorFields}
      // saveBtnAction={createSell}
      // isRecordCreated={isSellCreated}
      openBtnText="Добави"
      title="Дoбави допълнителен приход"
    >
      <IncomeForm
        //data={sellData}
        errorFields={errorFields}
        disributors={disributors}
        //handleFieldChange={handleFieldChange}
      />
    </Modal>
  );

  return (
    <Layout title="Допълнителни Приходи">
      <div className="min-h-screen 2xl:px-10">
        <Table
          title="Приходи"
          data={filteredAllIcomes}
          columns={["съобщение", "сума"]}
          //delete={handleDeleteIncome}
          perPage={perPage}
          orderColumn={orderColumn}
          setOrderColumn={setOrderColumn}
          //   filterSearchOnClick={searchSales}
          //   clearFilterData={clearFilterData}
          //   filterData={filterData}
          showFilter={showFilter}
          setShowFilter={setShowFilter}
          //   setFilterData={setFilterData}
          totalPages={allIcomes.pagination?.total_pages}
          isLoading={isLoading}
          setPerPage={setPerPage}
          searchBarButton={modal}
          searchBarPlaceholder="дистрибутор"
          //searchBarValue={searchText}
          //setSearchBarText={setSearchText}
          filterSection={true}
        >
          <Pagination
            isLoading={isLoading}
            currentPage={allIcomes.pagination?.current_page}
            totalPages={allIcomes.pagination?.total_pages}
            totalItems={allIcomes.pagination?.total_results}
            perPage={allIcomes.pagination?.per_page}
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

export default observer(DashboardIncomes);
