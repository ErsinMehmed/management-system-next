import Textarea from "@/components/html/Textarea";
import Select from "@/components/html/Select";
import Input from "@/components/html/Input";
import { formatCurrency } from "@/utils";

const SellForm = (props) => {
  return (
    <div className='space-y-3.5 mt-2.5'>
      <Select
        items={props.updatedProducts}
        label='Избери продукт'
        value={props.data.product || ""}
        errorMessage={props.errorFields.product}
        onChange={(value) => props.handleFieldChange("product", value)}
      />

      <Input
        type='text'
        label='Количество'
        value={props.data.quantity || ""}
        disabled={!props.data.product}
        errorMessage={props.errorFields.quantity}
        onChange={(value) => props.handleFieldChange("quantity", value)}
      />

      <Input
        type='text'
        label='Цена'
        value={props.data.price || ""}
        disabled={!props.data.quantity}
        errorMessage={props.errorFields.price}
        onChange={(value) => props.handleFieldChange("price", value)}
      />

      <div className='grid grid-cols-2 gap-3.5'>
        <Input
          type='text'
          label='Разход на 100км'
          value={props.data.fuel_consumption || ""}
          errorMessage={props.errorFields.fuel_consumption}
          onChange={(value) =>
            props.handleFieldChange("fuel_consumption", value)
          }
        />

        <Input
          type='text'
          label='Цена на дизела'
          value={props.data.diesel_price || ""}
          errorMessage={props.errorFields.diesel_price}
          onChange={(value) => props.handleFieldChange("diesel_price", value)}
        />
      </div>

      <Input
        type='text'
        label='Изминати километри'
        value={props.data.mileage || ""}
        disabled={!props.data.diesel_price && !props.data.fuel_consumption}
        errorMessage={props.errorFields.mileage}
        onChange={(value) => props.handleFieldChange("mileage", value)}
      />

      <Input
        type='text'
        label='Допълнителни разходи'
        value={props.data.additional_costs || ""}
        onChange={(value) => props.handleFieldChange("additional_costs", value)}
      />

      <Input
        type='date'
        label='Дата'
        value={props.data.date || ""}
        onChange={(value) => props.handleFieldChange("date", value)}
      />

      <Textarea
        label='Съобщение'
        value={props.data.message || ""}
        onChange={(value) => props.handleFieldChange("message", value)}
      />

      <div className='grid grid-cols-2 gap-3.5'>
        <div className='bg-[#f4f4f5] p-5 text-slate-600 rounded-lg shadow-sm text-center font-semibold'>
          <div className='text-sm'>Продажна цена</div>

          <div>
            {props.data.price
              ? formatCurrency(props.data.price, 2) + "лв."
              : "0.00лв."}
          </div>
        </div>

        <div className='bg-[#f4f4f5] p-5 text-slate-600 rounded-lg shadow-sm text-center font-semibold'>
          <div className='text-sm'>Разходи за гориво</div>

          <div>
            {props.data.fuel_price
              ? formatCurrency(props.data.fuel_price, 2) + "лв."
              : "0.00лв."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellForm;
