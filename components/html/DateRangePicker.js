import React, { useState } from "react";
import { DateRangePicker } from "@nextui-org/react";
import { parseDate } from "@internationalized/date";

const DateRangePickerComponent = (props) => {
  const [value, setValue] = useState({
    start: parseDate("2024-04-01"),
    end: parseDate("2024-04-08"),
  });

  return (
    <DateRangePicker
      classNames={{
        base: "bg-white",
      }}
      label={props.label}
      value={value}
      onChange={setValue}
    />
  );
};

export default DateRangePickerComponent;
