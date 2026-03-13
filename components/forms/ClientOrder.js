import Input from "@/components/html/Input";
import Select from "@/components/html/Select";
import Textarea from "@/components/html/Textarea";

const ClientOrderForm = ({ data, errorFields, products, sellers = [], handleFieldChange }) => {
  return (
    <div className="space-y-3.5 mt-2.5">
      <Input
        type="text"
        label="Телефон на клиента"
        value={data.phone || ""}
        errorMessage={errorFields?.phone}
        onChange={(value) => handleFieldChange("phone", value)}
      />

      <Select
        items={products}
        label="Избери продукт"
        value={data.product || ""}
        errorMessage={errorFields?.product}
        onChange={(value) => handleFieldChange("product", value)}
      />

      <Input
        type="number"
        label="Брой"
        value={data.quantity || ""}
        disabled={!data.product}
        errorMessage={errorFields?.quantity}
        onChange={(value) => handleFieldChange("quantity", value)}
      />

      <Input
        type="number"
        label="Цена"
        value={data.price || ""}
        errorMessage={errorFields?.price}
        onChange={(value) => handleFieldChange("price", value)}
      />

      <Input
        type="text"
        label="Адрес (по избор)"
        value={data.address || ""}
        onChange={(value) => handleFieldChange("address", value)}
      />

      <Textarea
        label="Бележка (по избор)"
        value={data.note || ""}
        onChange={(value) => handleFieldChange("note", value)}
      />

      {sellers.length > 0 && (
        <Select
          items={sellers}
          label="Избери доставчик"
          value={data.assignedTo || ""}
          errorMessage={errorFields?.assignedTo}
          onChange={(value) => handleFieldChange("assignedTo", value)}
        />
      )}
    </div>
  );
};

export default ClientOrderForm;
