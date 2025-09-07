import React from "react";
import { DatePicker } from "@heroui/react";
import { parseDate } from "@internationalized/date";

const DatePickerComponent = ({
  label,
  value,
  onChange,
  minValue,
  maxValue,
}) => {
  return (
    <DatePicker
      showMonthAndYearPickers
      firstDayOfWeek='mon'
      label={label}
      value={value ? parseDate(value) : undefined}
      minValue={minValue ? parseDate(minValue) : undefined}
      maxValue={maxValue ? parseDate(maxValue) : undefined}
      onChange={(date) => onChange(date ? date.toString() : undefined)}
      classNames={{
        inputWrapper: "h-12",
        input: "py-1",
      }}
    />
  );
};

export default DatePickerComponent;
