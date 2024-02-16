"use client";
import { observer } from "mobx-react-lite";
import Layout from "@/components/layout/Dashboard";
import Modal from "@/components/Modal";
import Box from "@/components/product/Box";
import { commonStore, productStore } from "@/stores/useStore";
import ProductForm from "@/components/forms/Product";
import productAction from "@/actions/productAction";

const DashboardProducts = () => {
  const { products, productData, updateProduct, setProductData } = productStore;
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

  return (
    <Layout title="Наличности">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 sm:p-8">
        {products.map(
          (product, index) =>
            product.availability && (
              <Modal
                key={index}
                title="Редактирай продукт"
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
                }
              >
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
