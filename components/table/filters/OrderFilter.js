import React, { useMemo } from "react";
import Input from "@/components/html/Input";
import Select from "@/components/html/Select";
import { productTitle } from "@/utils";
import { productStore } from "@/stores/useStore";

function OrderFilter(props) {
  const { products } = productStore;

  const handleInputChange = (name, value) => {
    props.setData({ ...props.data, [name]: value });
  };
  console.log(props.data);
  const updatedProducts = useMemo(() => {
    return products.map((product) => ({
      ...product,
      name: productTitle(product),
    }));
  }, [products]);

  return (
    <>
      <div className="px-3 lg:px-4 col-span-2">
        <div className="font-semibold ml-0.5">Дата на добавяне</div>
        <div className="sm:flex space-y-4 sm:space-y-0 sm:space-x-3.5 mt-1.5">
          <Input
            type="date"
            label="От"
            value={props.data.dateFrom || ""}
            onChange={(value) => handleInputChange("dateFrom", value)}
          />

          <Input
            type="date"
            label="До"
            value={props.data.dateTo || ""}
            onChange={(value) => handleInputChange("dateTo", value)}
          />
        </div>
      </div>

      <div className="px-3 lg:px-4 col-span-2 mt-4 md:mt-0">
        <div className="font-semibold ml-0.5">Количество</div>
        <div className="sm:flex space-y-4 sm:space-y-0 sm:space-x-3.5 mt-1.5">
          <Input
            type="text"
            label="От"
            value={props.data.minQuantity || ""}
            onChange={(value) => handleInputChange("minQuantity", value)}
          />

          <Input
            type="text"
            label="До"
            value={props.data.maxQuantity || ""}
            onChange={(value) => handleInputChange("maxQuantity", value)}
          />
        </div>
      </div>

      <div className="px-3 sm:pl-3 pr-2 md:px-3 lg:px-4 col-span-1 mt-4 lg:mt-0">
        <div className="font-semibold mb-1.5 ml-0.5">Продукт</div>

        <Select
          items={updatedProducts}
          label="Избери продукт"
          value={props.data.product || ""}
          onChange={(value) => handleInputChange("product", value)}
        />
      </div>
    </>
  );
}

export default OrderFilter;
