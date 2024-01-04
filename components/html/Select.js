import { Select, SelectItem } from "@nextui-org/react";

const SelectComponent = (props) => {
  const handleChange = (event) => {
    props.onChange(event.target.value);
  };

  return (
    <Select
      label={props.label}
      className="w-full"
      size={"sm"}
      onChange={handleChange}
      defaultSelectedKeys={props.value ? [props.value] : []}
      isInvalid={props.errorMessage ? true : false}
      errorMessage={props.errorMessage}
    >
      {props.items?.map((item) => (
        <SelectItem key={item._id ?? item.value} value={item._id ?? item.value}>
          {item.name ?? item.value}
        </SelectItem>
      ))}
    </Select>
  );
};

export default SelectComponent;
