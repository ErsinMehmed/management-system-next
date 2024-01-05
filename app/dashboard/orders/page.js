"use client";
import React, { useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";
import Layout from "@/components/layout/Dashboard";
import Modal from "@/components/Modal";
import Textarea from "@/components/html/Textarea";
import Select from "@/components/html/Select";
import Input from "@/components/html/Input";
import Table from "@/components/table/Table";
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
    handlePageChange,
    handlePageClick,
    setPerPage,
    setSearchText,
    setFilterData,
    searchProducts,
    setOrderData,
    clearOrderData,
    createOrder,
    loadOrders,
    deleteProduct,
    setShowFilter,
  } = orderStore;
  const { products, loadProducts } = productStore;
  const { errorFields } = commonStore;

  const handleDeleteProduct = (id) => {
    deleteProduct(id);
  };

  const filteredProducts = orders?.orders?.map(
    ({ _id, product, quantity, price, total_amount, message }) => ({
      _id,
      product,
      quantity,
      price,
      total_amount,
      message,
    })
  );

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const updatedProducts = useMemo(() => {
    return products.map((product) => ({
      ...product,
      name: productTitle(product),
    }));
  }, [products]);

  const handleInputChange = (name, value) => {
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
      errorFields={errorFields}
      saveBtnAction={createOrder}
      openBtnText="Добави"
      title="Добави поръчка"
    >
      <div className="space-y-3.5">
        <Select
          items={updatedProducts}
          label="Избери продукт"
          value={orderData.product || ""}
          errorMessage={errorFields.product}
          onChange={(value) => handleInputChange("product", value)}
        />

        <Input
          type="text"
          label="Количество"
          value={orderData.quantity || ""}
          disabled={!orderData.product}
          errorMessage={errorFields.quantity}
          onChange={(value) => handleInputChange("quantity", value)}
        />

        <Textarea
          label="Съобщение"
          value={orderData.message || ""}
          onChange={(value) => handleInputChange("message", value)}
        />

        <div className="grid grid-cols-2 gap-3.5">
          <div className="bg-[#f4f4f5] p-5 text-slate-600 rounded-lg shadow-sm text-center font-semibold">
            <div className="text-sm">Единична цена</div>

            <div>
              {orderData.price ? orderData.price.toFixed(2) + "лв." : "0.00лв."}
            </div>
          </div>

          <div className="bg-[#f4f4f5] p-5 text-slate-600 rounded-lg shadow-sm text-center font-semibold">
            <div className="text-sm">Обща сума</div>

            <div>
              {orderData.total_amount
                ? orderData.total_amount.toFixed(2) + "лв."
                : "0.00лв."}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );

  return (
    <Layout>
      <div className="flex items-center min-h-screen 2xl:px-10">
        <Table
          title="Заявки"
          data={filteredProducts}
          columns={["име на продукт", "количество", "ед. цена", "обща сума"]}
          delete={handleDeleteProduct}
          perPage={perPage}
          filterSearchOnClick={searchProducts}
          //clearFilterData={clearFilterData}
          filterData={filterData}
          showFilter={showFilter}
          setShowFilter={setShowFilter}
          setFilterData={setFilterData}
          totalPages={orders.pagination?.total_pages}
          isLoading={isLoading}
          setPerPage={setPerPage}
          searchBarButton={modal}
          searchBarPlaceholder="име на продукт"
          searchBarValue={searchText}
          setSearchBarText={setSearchText}
          filterSection={true}
          editButtonLink="/dashboard/ads/edit/"
        >
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
