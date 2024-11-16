import Textarea from "@/components/html/Textarea";
import Select from "@/components/html/Select";
import Input from "@/components/html/Input";

const IncomeForm = (props) => {
  return (
    <div className='space-y-3.5 mt-2.5'>
      <Select
        items={props.distributors}
        label='Избери дистрибутор'
        value={props.data.distributor || ""}
        errorMessage={props.errorFields.distributor}
        onChange={(value) => props.handleFieldChange("distributor", value)}
      />

      <Input
        type='text'
        label='Сума'
        value={props.data.amount || ""}
        disabled={!props.data.distributor}
        errorMessage={props.errorFields.amount}
        onChange={(value) => props.handleFieldChange("amount", value)}
      />

      <Textarea
        label='Съобщение'
        disabled={!props.data.distributor}
        value={props.data.message || ""}
        errorMessage={props.errorFields.message}
        onChange={(value) => props.handleFieldChange("message", value)}
      />
    </div>
  );
};

export default IncomeForm;
