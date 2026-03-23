"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { observer } from "mobx-react-lite";
import Layout from "@/components/layout/Dashboard";
import Modal from "@/components/Modal";
import Box from "@/components/product/Box";
import { commonStore, productStore } from "@/stores/useStore";
import { Switch, Chip } from "@heroui/react";
import { productTitle } from "@/utils";
import ProductForm from "@/components/forms/Product";
import productAction from "@/actions/productAction";

const ProductsClient = () => {
  const {
    products,
    productData,
    isProductUpdated,
    updateProduct,
    setProductData,
    loadProducts,
  } = productStore;
  const { errorFields } = commonStore;
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const onEditOpen = () => setIsEditOpen(true);
  const onEditOpenChange = (open) => setIsEditOpen(open);
  const [isVisibilityOpen, setIsVisibilityOpen] = useState(false);
  const onVisibilityOpen = () => setIsVisibilityOpen(true);
  const onVisibilityOpenChange = (open) => setIsVisibilityOpen(open);
  const { data: session } = useSession();
  const isUserAdmin = session?.user?.role === "Super Admin";

  const handleFieldChange = (name, value, index) => {
    let updatedData = { ...productData };

    if (name === "sell_prices" || name === "seller_prices") {
      updatedData[name] = [...(updatedData[name] || [])];
      updatedData[name][index] = value;
    } else {
      updatedData = { ...updatedData, [name]: value };
    }

    setProductData(updatedData);
  };

  const fetchProductData = async (id) => {
    const data = await productAction.getProduct(id);

    setProductData(data);
  };

  const removeData = (index, field = "sell_prices") => {
    const updatedData = { ...productData };
    updatedData[field] = [...(updatedData[field] || [])];
    updatedData[field].splice(index, 1);
    setProductData(updatedData);
  };

  const addData = (field = "sell_prices") => {
    const updatedData = { ...productData };
    updatedData[field] = [...(updatedData[field] || []), ""];
    setProductData(updatedData);
  };

  const updateProductAndReload = async (product) => {
    const response = await productAction.updateProduct(product._id, {
      hidden: !product.hidden,
    });

    if (response.status === true) {
      loadProducts();
    }
  };

  return (
    <Layout title='Наличности'>
      {isUserAdmin && (
        <button
          onClick={onVisibilityOpen}
          className='text-white absolute -top-[4.1rem] sm:-top-[4.6rem] right-3 sm:right-10 bg-[#0071f5] hover:bg-blue-600 focus:outline-none font-semibold rounded-full text-sm px-3 sm:px-4 2xl:px-6 py-1.5 2xl:py-2.5 text-center transition-all active:scale-90'>
          Видимост
        </button>
      )}

      <div className='grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 sm:p-8'>
        {products.map(
          (product, index) =>
            !product.hidden && (
              <Box
                key={index}
                onClick={() => {
                  if (isUserAdmin) {
                    setSelectedProductId(product._id);
                    setProductData({});
                    fetchProductData(product._id);
                    onEditOpen();
                  }
                }}
                data={product}
              />
            )
        )}
      </div>

      <Modal
        isOpen={isVisibilityOpen}
        onOpenChange={onVisibilityOpenChange}
        title='Редактирай продукти'
        showFooter={false}>
        <div className='border-b pb-6 w-full'>
          {products.map((product, index) => (
            <div
              key={index}
              className={`grid grid-cols-4 gap-4 place-content-around ${
                index === products.length - 1
                  ? "pt-2"
                  : "border-b border-slate-200 py-2"
              }`}>
              <div className='col-span-2 font-semibold text-slate-700'>
                {productTitle(product)}
              </div>

              <Chip
                className={!product.hidden ? "bg-green-400 text-white" : "bg-red-400 text-white"}>
                {!product.hidden ? "Видим" : "Скрит"}
              </Chip>

              <Switch
                checked={!product.hidden}
                onChange={() => updateProductAndReload(product)}
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch>
            </div>
          ))}
        </div>
      </Modal>

      {isUserAdmin && (
        <Modal
          isOpen={isEditOpen}
          onOpenChange={onEditOpenChange}
          title='Редактирай продукт'
          isLoading={isProductUpdated}
          onSave={() => updateProduct(selectedProductId, productData)}>
          <ProductForm
            addData={addData}
            data={productData}
            removeData={removeData}
            errorFields={errorFields}
            handleFieldChange={handleFieldChange}
          />
        </Modal>
      )}
    </Layout>
  );
};

export default observer(ProductsClient);
