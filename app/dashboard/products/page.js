"use client";
import { observer } from "mobx-react-lite";
import { BsTrash3 } from "react-icons/bs";
import { HiOutlinePlus } from "react-icons/hi2";
import Layout from "@/components/layout/Dashboard";
import Modal from "@/components/Modal";
import Box from "@/components/product/Box";
import { commonStore, productStore } from "@/stores/useStore";
import productAction from "@/actions/productAction";
import Input from "@/components/html/Input";

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
        {products.map((product, index) => (
          <Modal
            key={index}
            title="Редактирай продукт"
            saveBtnAction={() => {
              return updateProduct(product._id, productData);
            }}
            openButton={
              <Box
                onClick={() => {
                  fetchProductData(product._id);
                }}
                data={product}
              />
            }
          >
            <div className="border-b pb-6">
              <div className="text-slate-800 font-semibold mb-2">
                Цена за зареждане
              </div>

              <Input
                type="text"
                label="Цена на зареждане"
                value={productData.price || ""}
                errorMessage={errorFields.price}
                onChange={(value) => handleFieldChange("price", value)}
              />
            </div>

            <div className="border-b pb-6">
              <div className="text-slate-800 font-semibold mb-2">Наличност</div>

              <Input
                type="text"
                label="Начличност на проддукта"
                value={productData.availability || ""}
                errorMessage={errorFields.availability}
                onChange={(value) => handleFieldChange("availability", value)}
              />
            </div>

            <div className="pt-1 space-y-2">
              <div className="text-slate-800 font-semibold">
                Цена за продажба
              </div>

              <div className="space-y-3.5">
                {productData.sell_prices?.map((price, index) => (
                  <div key={index} className="flex items-center">
                    {productData.sell_prices.length > 1 && (
                      <button
                        className="rounded-full p-2 bg-white border hover:bg-slate-50 transition-all active:scale-95 mr-2"
                        onClick={() => removeData(index)}
                      >
                        <BsTrash3 />
                      </button>
                    )}

                    <Input
                      type="text"
                      label={`Цена за ${index + 1}бр.`}
                      value={price || ""}
                      errorMessage={
                        errorFields.sell_prices?.positions.includes(index) &&
                        errorFields.sell_prices?.message
                      }
                      onChange={(value) =>
                        handleFieldChange("sell_prices", value, index)
                      }
                    />
                  </div>
                ))}

                <div className="flex justify-center mt-4 w-full">
                  <button
                    className="rounded-full p-2 bg-white border hover:bg-slate-50 transition-all active:scale-95"
                    onClick={addData}
                  >
                    <HiOutlinePlus />
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        ))}
      </div>
    </Layout>
  );
};

export default observer(DashboardProducts);
