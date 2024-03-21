"use client";
import React, { useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";
import Layout from "@/components/layout/Dashboard";
import Modal from "@/components/Modal";
import Table from "@/components/table/Table";
import OrderForm from "@/components/forms/Order";
import Pagination from "@/components/table/Pagination";
import { productTitle } from "@/utils";
import { commonStore, orderStore, productStore } from "@/stores/useStore";

const DashboardOrders = () => {
  const {
    orders,
    orderData,
    perPage,
    isLoading,
    searchText,
    filterData,
    showFilter,
    orderColumn,
    handlePageChange,
    handlePageClick,
    setOrderColumn,
    setPerPage,
    setSearchText,
    setFilterData,
    searchOrders,
    setOrderData,
    clearOrderData,
    clearFilterData,
    createOrder,
    loadOrders,
    deleteOrder,
    setShowFilter,
  } = orderStore;
  const { products } = productStore;
  const { errorFields } = commonStore;

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleDeleteOrder = (id) => {
    deleteOrder(id);
  };

  const filteredOrders = orders?.items?.map(
    ({ _id, product, quantity, price, total_amount, date, message }) => ({
      _id,
      product,
      quantity,
      price,
      total_amount,
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

  const handleFieldChange = (name, value) => {
    let updatedData = { ...orderData };

    switch (name) {
      case "product":
        if (value === "") {
          clearOrderData();
          return;
        }

        const selectedProduct = products.find(
          (product) => product._id === value
        );

        updatedData.price = selectedProduct ? selectedProduct.price : 0;
        updatedData.total_amount =
          updatedData.quantity && selectedProduct.price * updatedData.quantity;
        break;
      case "quantity":
        value = parseInt(value, 10);

        updatedData.total_amount = updatedData.price * value;
        break;
      default:
        break;
    }

    setOrderData({ ...updatedData, [name]: value });
  };

  const modal = (
    <Modal
      isButton={true}
      errorFields={errorFields}
      saveBtnAction={createOrder}
      openBtnText='Добави'
      title='Добави поръчка'>
      <OrderForm
        data={orderData}
        errorFields={errorFields}
        updatedProducts={updatedProducts}
        handleFieldChange={handleFieldChange}
      />
    </Modal>
  );

  return (
    <Layout title='Поръчки'>
      <div className='min-h-screen 2xl:px-10'>
        <Table
          title='Заявки'
          data={filteredOrders}
          columns={["продукт", "количество", "ед. цена", "обща сума", "дата"]}
          delete={handleDeleteOrder}
          perPage={perPage}
          orderColumn={orderColumn}
          setOrderColumn={setOrderColumn}
          filterSearchOnClick={searchOrders}
          clearFilterData={clearFilterData}
          filterData={filterData}
          showFilter={showFilter}
          setShowFilter={setShowFilter}
          setFilterData={setFilterData}
          totalPages={orders.pagination?.total_pages}
          isLoading={isLoading}
          setPerPage={setPerPage}
          searchBarButton={modal}
          searchBarPlaceholder='име на продукт'
          searchBarValue={searchText}
          setSearchBarText={setSearchText}
          filterSection={true}>
          <Pagination
            isLoading={isLoading}
            currentPage={orders.pagination?.current_page}
            totalPages={orders.pagination?.total_pages}
            totalItems={orders.pagination?.total_results}
            perPage={orders.pagination?.per_page}
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

export default observer(DashboardOrders);
