"use client";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectIndicator,
  SelectPopover,
  ListBox,
  ListBoxItem,
  ListBoxItemIndicator,
  Label,
} from "@heroui/react";

const SelectComponent = (props) => {
  const handleChange = (value) => {
    if (props.onChange) props.onChange(value);
  };

  const items = props.items ?? [];
  const selectedValue = props.value ?? null;

  return (
    <Select
      value={selectedValue}
      onChange={handleChange}
      isDisabled={props.isDisabled}
      className={props.classes ?? props.baseClass ?? "w-full"}
    >
      {props.label && (
        <Label className="text-sm font-medium text-foreground/70 mb-1 block">
          {props.label}
        </Label>
      )}
      <SelectTrigger
        className={[
          "w-full rounded-lg border border-default-200 bg-default-50 px-3 py-2 text-sm",
          "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all",
          props.classes ?? props.baseClass ?? "",
          props.isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <SelectValue
          className="text-sm text-foreground"
          placeholder={props.placeholder ?? props.label ?? "Избери..."}
        />
        <SelectIndicator />
      </SelectTrigger>
      <SelectPopover>
        <ListBox>
          {items.map((item) => {
            const id = String(item._id ?? item.value ?? "");
            const label = item.name ?? item.value ?? "";
            return (
              <ListBoxItem key={id} id={id} textValue={label}>
                {label}
                <ListBoxItemIndicator />
              </ListBoxItem>
            );
          })}
        </ListBox>
      </SelectPopover>
    </Select>
  );
};

export default SelectComponent;
