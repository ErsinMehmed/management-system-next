"use client";
import { parseDate } from "@internationalized/date";
import {
  DatePicker,
  DateField,
  Calendar,
  Label,
} from "@heroui/react";

const DatePickerComponent = ({ label, value, onChange, minValue, maxValue }) => {
  return (
    <DatePicker
      className="w-full"
      value={value ? parseDate(value) : undefined}
      minValue={minValue ? parseDate(minValue) : undefined}
      maxValue={maxValue ? parseDate(maxValue) : undefined}
      onChange={(date) => onChange(date ? date.toString() : undefined)}
    >
      {label && (
        <Label>
          {label}
        </Label>
      )}

      <DateField.Group fullWidth>
        <DateField.Input>
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger>
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>

      <DatePicker.Popover>
        <Calendar>
          <Calendar.Header>
            <Calendar.YearPickerTrigger>
              <Calendar.YearPickerTriggerHeading />
              <Calendar.YearPickerTriggerIndicator />
            </Calendar.YearPickerTrigger>
            <Calendar.NavButton slot="previous" />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>

          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>
              {(date) => <Calendar.Cell date={date} />}
            </Calendar.GridBody>
          </Calendar.Grid>

          <Calendar.YearPickerGrid>
            <Calendar.YearPickerGridBody>
              {({ year }) => <Calendar.YearPickerCell year={year} />}
            </Calendar.YearPickerGridBody>
          </Calendar.YearPickerGrid>
        </Calendar>
      </DatePicker.Popover>
    </DatePicker>
  );
};

export default DatePickerComponent;
