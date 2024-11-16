import Textarea from "@/components/html/Textarea";
import Select from "@/components/html/Select";
import Input from "@/components/html/Input";
import { formatCurrency } from "@/utils";

const IncomeForm = (props) => {
  return (
    <div className="space-y-3.5 mt-2.5">
      <Select
        items={props.disributors}
        label="Избери дистрибутор"
        value={props.data.distributor || ""}
        errorMessage={props.errorFields.distributor}
        onChange={(value) => props.handleFieldChange("distributor", value)}
      />

      <Input
        type="text"
        label="Сума"
        value={props.data.amount || ""}
        disabled={!props.data.amount}
        errorMessage={props.errorFields.amount}
        onChange={(value) => props.handleFieldChange("amount", value)}
      />

      <Textarea
        label="Съобщение"
        value={props.data.message || ""}
        onChange={(value) => props.handleFieldChange("message", value)}
      />
    </div>
  );
};

export default IncomeForm;
