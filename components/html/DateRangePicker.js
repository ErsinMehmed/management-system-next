import React from "react";
import { DateRangePicker } from "@nextui-org/react";
import { getLocalTimeZone, today } from "@internationalized/date";

const DateRangePickerComponent = (props) => {
  const { value, onChange, label } = props;

  return (
    <DateRangePicker
      classNames={{
        base: "bg-white",
      }}
      maxValue={today(getLocalTimeZone())}
      label={label}
      value={value}
      onChange={onChange}
    />
  );
};

export default DateRangePickerComponent;
