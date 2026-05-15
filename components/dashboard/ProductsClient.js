"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { observer } from "mobx-react-lite";
import Layout from "@/components/layout/Dashboard";
import Modal from "@/components/Modal";
import Box from "@/components/product/Box";
import { commonStore, productStore } from "@/stores/useStore";
import { Switch, Chip, useDisclosure } from "@heroui/react";
import { FiPlus, FiEye } from "react-icons/fi";
import { productTitle } from "@/utils";
import ProductForm from "@/components/forms/Product";
import productAction from "@/actions/productAction";
import CreateProductModal from "@/components/dashboard/CreateProductModal";

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
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isVisibilityOpen, onOpen: onVisibilityOpen, onOpenChange: onVisibilityOpenChange } = useDisclosure();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateOpenChange } = useDisclosure();
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
        <div className='flex items-center justify-end gap-2 mb-4'>
          <button
            onClick={onCreateOpen}
            aria-label='Добави'
            className='flex items-center gap-1.5 text-white bg-[#0071f5] hover:bg-blue-600 focus:outline-none font-semibold rounded-full text-sm px-3 sm:px-5 py-2 transition-all active:scale-90 cursor-pointer'>
            <FiPlus className='w-4 h-4' />
            <span className='hidden sm:inline'>Добави</span>
          </button>
          <button
            onClick={onVisibilityOpen}
            aria-label='Видимост'
            className='flex items-center gap-1.5 text-white bg-[#0071f5] hover:bg-blue-600 focus:outline-none font-semibold rounded-full text-sm px-3 sm:px-5 py-2 transition-all active:scale-90 cursor-pointer'>
            <FiEye className='w-4 h-4' />
            <span className='hidden sm:inline'>Видимост</span>
          </button>
        </div>
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
                classNames={{
                  base: !product.hidden
                    ? "bg-green-400 text-white"
                    : "bg-red-400 text-white",
                }}>
                {!product.hidden ? "Видим" : "Скрит"}
              </Chip>

              <Switch
                isSelected={!product.hidden}
                onValueChange={() => updateProductAndReload(product)}
              />
            </div>
          ))}
        </div>
      </Modal>

      <CreateProductModal isOpen={isCreateOpen} onOpenChange={onCreateOpenChange} />

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
