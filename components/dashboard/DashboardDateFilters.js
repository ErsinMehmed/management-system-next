import React from "react";
import Select from "@/components/html/Select";
import DatePicker from "@/components/html/DatePicker";
import { today, getLocalTimeZone } from "@internationalized/date";
import { periods } from "@/data";

const DashboardDateFilters = ({ dashboardBoxPeriod, handleFieldChange }) => {
  return (
    <div className='grid grid-cols-3'>
      <div className='col-span-3 lg:col-span-2 lg:col-start-2 lg:ml-2 flex flex-col lg:flex-row items-center bg-white p-3 gap-3.5 w-full rounded-md shadow-md mb-5'>
        <DatePicker
          label='От'
          value={dashboardBoxPeriod.dateFrom}
          maxValue={
            dashboardBoxPeriod.dateTo || today(getLocalTimeZone()).toString()
          }
          onChange={(val) => handleFieldChange("dateFrom", val)}
        />

        <DatePicker
          label='До'
          value={dashboardBoxPeriod.dateTo}
          minValue={dashboardBoxPeriod.dateFrom}
          maxValue={today(getLocalTimeZone()).toString()}
          onChange={(val) => handleFieldChange("dateTo", val)}
        />

        <Select
          items={periods}
          label='Избери период'
          value={dashboardBoxPeriod.period || ""}
          onChange={(value) => handleFieldChange("period", value)}
        />
      </div>
    </div>
  );
};

export default DashboardDateFilters;
