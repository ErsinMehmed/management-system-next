import { Select, SelectItem } from "@heroui/react";

const SelectComponent = (props) => {
  const handleChange = (event) => {
    props.onChange(event.target.value);
  };

  const selectedProps = props.controlled
    ? { selectedKeys: props.value ? [props.value] : [] }
    : { defaultSelectedKeys: props.value ? [props.value] : [] };

  return (
    <Select
      label={props.label}
      classNames={{
        trigger: props.classes ?? "w-full",
      }}
      size={"sm"}
      onChange={handleChange}
      {...selectedProps}
      isInvalid={props.errorMessage ? true : false}
      errorMessage={props.errorMessage}>
      {props.items?.map((item) => (
        <SelectItem
          key={item._id ?? item.value}
          value={item._id ?? item.value}>
          {item.name ?? item.value}
        </SelectItem>
      ))}
    </Select>
  );
};

export default SelectComponent;
