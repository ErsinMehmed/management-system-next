import React from "react";
import {DatePicker} from "@heroui/react";
import Select from "@/components/html/Select";
import {parseDate, today, getLocalTimeZone} from "@internationalized/date";
import {periods} from "@/data";

const DashboardDateFilters = ({dashboardBoxPeriod, handleFieldChange}) => {
    return (
        <div className='grid grid-cols-3'>
            <div
                className='col-span-3 lg:col-span-2 lg:col-start-2 lg:ml-2 flex flex-col lg:flex-row items-center bg-white p-3 gap-3.5 w-full rounded-md shadow-md mb-5'
            >
                <DatePicker
                    showMonthAndYearPickers
                    label="От"
                    maxValue={
                        dashboardBoxPeriod.dateTo
                            ? parseDate(dashboardBoxPeriod.dateTo)
                            : today(getLocalTimeZone())
                    }
                    value={
                        dashboardBoxPeriod.dateFrom
                            ? parseDate(dashboardBoxPeriod.dateFrom)
                            : undefined
                    }
                    onChange={(value) =>
                        handleFieldChange("dateFrom", value.toString())
                    }
                    classNames={{
                        inputWrapper: "h-12",
                        input: "py-1",
                    }}
                />

                <DatePicker
                    showMonthAndYearPickers
                    label="До"
                    maxValue={today(getLocalTimeZone())}
                    minValue={
                        dashboardBoxPeriod.dateFrom
                            ? parseDate(dashboardBoxPeriod.dateFrom)
                            : undefined
                    }
                    value={
                        dashboardBoxPeriod.dateTo
                            ? parseDate(dashboardBoxPeriod.dateTo)
                            : undefined
                    }
                    onChange={(value) =>
                        handleFieldChange("dateTo", value.toString())
                    }
                    classNames={{
                        inputWrapper: "h-12",
                        input: "py-1",
                    }}
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