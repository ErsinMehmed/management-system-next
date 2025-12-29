import React from "react";
import dynamic from "next/dynamic";
import { parseDate } from "@internationalized/date";

const DatePicker = dynamic(
  () => import("@heroui/react").then((mod) => mod.DatePicker),
  {
    ssr: false,
    loading: () => (
      <div className='h-12 w-full bg-gray-100 animate-pulse rounded-lg'></div>
    ),
  }
);

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
