import Textarea from "@/components/html/Textarea";
import Select from "@/components/html/Select";
import Input from "@/components/html/Input";

const OrdersForm = (props) => {
  return (
    <div className="space-y-3.5">
      <Select
        items={props.updatedProducts}
        label="Избери продукт"
        value={props.data.product || ""}
        errorMessage={props.errorFields.product}
        onChange={(value) => props.handleFieldChange("product", value)}
      />

      <Input
        type="text"
        label="Количество"
        value={props.data.quantity || ""}
        disabled={!props.data.product}
        errorMessage={props.errorFields.quantity}
        onChange={(value) => props.handleFieldChange("quantity", value)}
      />

      <Input
        type="date"
        label="Дата"
        value={props.data.date || ""}
        onChange={(value) => props.handleFieldChange("date", value)}
      />

      <Textarea
        label="Съобщение"
        value={props.data.message || ""}
        onChange={(value) => props.handleFieldChange("message", value)}
      />

      <div className="grid grid-cols-2 gap-3.5">
        <div className="bg-[#f4f4f5] p-5 text-slate-600 rounded-lg shadow-sm text-center font-semibold">
          <div className="text-sm">Единична цена</div>

          <div>
            {props.data.price ? props.data.price.toFixed(2) + "лв." : "0.00лв."}
          </div>
        </div>

        <div className="bg-[#f4f4f5] p-5 text-slate-600 rounded-lg shadow-sm text-center font-semibold">
          <div className="text-sm">Обща сума</div>

          <div>
            {props.data.total_amount
              ? props.data.total_amount.toFixed(2) + "лв."
              : "0.00лв."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersForm;
