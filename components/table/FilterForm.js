import React, { useMemo } from "react";
import Input from "@/components/html/Input";
import Select from "@/components/html/Select";
import { productTitle } from "@/utils";
import { productStore } from "@/stores/useStore";

function FilterForm(props) {
  const { products } = productStore;

  const handleFieldChange = (name, value) => {
    props.setData({ ...props.data, [name]: value });
  };

  const updatedProducts = useMemo(() => {
    return products.map((product) => ({
      ...product,
      name: productTitle(product),
    }));
  }, [products]);

  return (
    <>
      <div className='px-2.5 col-span-2'>
        <div className='font-semibold ml-0.5'>Дата на добавяне</div>
        <div className='sm:flex space-y-4 sm:space-y-0 sm:space-x-3.5 mt-1.5'>
          <Input
            type='date'
            label='От'
            value={props.data.dateFrom || ""}
            onChange={(value) => handleFieldChange("dateFrom", value)}
          />

          <Input
            type='date'
            label='До'
            value={props.data.dateTo || ""}
            onChange={(value) => handleFieldChange("dateTo", value)}
          />
        </div>
      </div>

      <div className='px-2.5 col-span-2 mt-4 md:mt-0'>
        <div className='font-semibold ml-0.5'>Количество</div>
        <div className='sm:flex space-y-4 sm:space-y-0 sm:space-x-3.5 mt-1.5'>
          <Input
            type='text'
            label='Мин'
            value={props.data.minQuantity || ""}
            onChange={(value) => handleFieldChange("minQuantity", value)}
          />

          <Input
            type='text'
            label='Макс'
            value={props.data.maxQuantity || ""}
            onChange={(value) => handleFieldChange("maxQuantity", value)}
          />
        </div>
      </div>

      <div className='px-2.5 col-span-1 mt-4 lg:mt-0'>
        <div className='font-semibold mb-1.5 ml-0.5'>Продукт</div>

        <Select
          items={updatedProducts}
          label='Избери продукт'
          value={props.data.product || ""}
          onChange={(value) => handleFieldChange("product", value)}
        />
      </div>
    </>
  );
}

export default FilterForm;
