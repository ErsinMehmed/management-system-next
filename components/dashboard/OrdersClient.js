"use client";
import React, { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import Layout from "@/components/layout/Dashboard";
import Modal from "@/components/Modal";
import Table from "@/components/table/Table";
import OrderForm from "@/components/forms/Order";
import Pagination from "@/components/table/Pagination";
import { FiPlus } from "react-icons/fi";
import { productTitle } from "@/utils";
import { commonStore, orderStore, productStore } from "@/stores/useStore";

const OrdersClient = ({ initialData }) => {
  const {
    orders,
    orderData,
    perPage,
    isLoading,
    searchText,
    filterData,
    showFilter,
    orderColumn,
    isOrderCreated,
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
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onOpenChange = (open) => setIsOpen(open);

  useEffect(() => {
    if (initialData) {
      orderStore.hydrateOrders(initialData.orders);
      return;
    }
    loadOrders();
  }, []);

  const handleDeleteOrder = (id) => {
    deleteOrder(id);
  };

  const filteredOrders = orders?.items?.map(
    ({ _id, product, quantity, price, total_amount, date, message }) => ({
      _id,
      product,
      quantity,
      units_per_box: quantity / product.units_per_box,
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

  const addButton = (
    <button
      type="button"
      className="text-white bg-[#0071f5] hover:bg-blue-600 focus:outline-none font-semibold rounded-full text-sm px-1.5 sm:px-4 2xl:px-6 py-1.5 2xl:py-2.5 text-center transition-all active:scale-90"
      onClick={onOpen}>
      <span className="hidden sm:block">Добави</span>
      <FiPlus className="w-5 h-5 sm:hidden" />
    </button>
  );

  return (
    <Layout title='Поръчки'>
      <div className='min-h-screen 2xl:px-10'>
        <Table
          title='Заявки'
          data={filteredOrders}
          columns={["продукт", "количество", "кашони", "ед. цена", "обща сума", "дата"]}
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
          searchBarButton={addButton}
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

        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          title='Добави поръчка'
          isLoading={isOrderCreated}
          onSave={createOrder}>
          <OrderForm
            data={orderData}
            errorFields={errorFields}
            updatedProducts={updatedProducts}
            handleFieldChange={handleFieldChange}
          />
        </Modal>
      </div>
    </Layout>
  );
};

export default observer(OrdersClient);
