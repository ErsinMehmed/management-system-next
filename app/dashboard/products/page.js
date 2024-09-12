"use client";
import { observer } from "mobx-react-lite";
import Layout from "@/components/layout/Dashboard";
import Modal from "@/components/Modal";
import Box from "@/components/product/Box";
import { commonStore, productStore } from "@/stores/useStore";
import { Switch, Chip } from "@nextui-org/react";
import { productTitle } from "@/utils";
import ProductForm from "@/components/forms/Product";
import productAction from "@/actions/productAction";

const DashboardProducts = () => {
  const {
    products,
    productData,
    isProductUpdated,
    updateProduct,
    setProductData,
    loadProducts,
  } = productStore;
  const { errorFields } = commonStore;

  const handleFieldChange = (name, value, index) => {
    let updatedData = { ...productData };

    if (name === "sell_prices") {
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

  const removeData = (index) => {
    const updatedData = { ...productData };
    updatedData.sell_prices.splice(index, 1);

    setProductData(updatedData);
  };

  const addData = () => {
    const updatedData = { ...productData };
    updatedData.sell_prices.push("");

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
      <Modal
        title='Редактирай продукти'
        showFooter={true}
        openButton={
          <button className='text-white absolute -top-[4.1rem] sm:-top-[4.6rem] right-3 sm:right-10 bg-[#0071f5] hover:bg-blue-600 focus:outline-none font-semibold rounded-full text-sm px-3 sm:px-4 2xl:px-6 py-1.5 2xl:py-2.5 text-center transition-all active:scale-90'>
            Видимост
          </button>
        }>
        <div className='border-b pb-6 w-full'>
          {products.map((product, index) => (
            <div
              key={index}
              className={`grid grid-cols-4 gap-4 place-content-around ${
                index === products.length - 1 ? "pt-2" : "border-b py-2"
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

      <div className='grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 sm:p-8'>
        {products.map(
          (product, index) =>
            !product.hidden && (
              <Modal
                key={index}
                title='Редактирай продукт'
                isRecordCreated={isProductUpdated}
                saveBtnAction={() => {
                  return updateProduct(product._id, productData);
                }}
                openButton={
                  <Box
                    onClick={() => {
                      setProductData({});
                      fetchProductData(product._id);
                    }}
                    data={product}
                  />
                }>
                <ProductForm
                  addData={addData}
                  data={productData}
                  removeData={removeData}
                  errorFields={errorFields}
                  handleFieldChange={handleFieldChange}
                />
              </Modal>
            )
        )}
      </div>
    </Layout>
  );
};

export default observer(DashboardProducts);
