"use client";
import React, { useState, useMemo } from "react";
import { sellStore } from "@/stores/useStore";
import { IoIosArrowDown } from "react-icons/io";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner,
} from "@nextui-org/react";
import { dropdownPeriods } from "@/data";
import dynamic from "next/dynamic";

const Pie = (props) => {
  const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
  });

  const { pieChartPeriod, setPieChartPeriod } = sellStore;

  const pieChartBoxColor = ["blue", "purple", "amber", "rose"];

  const seriesData = [];
  const labels = [];
  let totalSalesCount = null;
  let totalBottleCount = null;

  if (props.status) {
    props.data.forEach((item) => {
      seriesData.push(item.total_quantity);
    });

    props.data.forEach((item) => {
      labels.push(item.name + " " + item.weight + "гр.");
    });

    totalSalesCount = props.data.reduce(
      (accumulator, stat) => accumulator + stat.sales_count,
      0
    );

    totalBottleCount = props.data.reduce(
      (accumulator, stat) => accumulator + stat.total_quantity,
      0
    );
  }

  const chartOptions = {
    series: seriesData,
    colors: ["#60a5fa", "#c084fc", "#fbbf24", "#fb7185"],
    chart: {
      height: 420,
      width: "100%",
      type: "pie",
    },
    stroke: {
      colors: ["white"],
      lineCap: "round",
    },
    plotOptions: {
      pie: {
        labels: {
          show: true,
        },
        size: "100%",
        dataLabels: {
          offset: -25,
        },
      },
    },
    labels: labels,
    dataLabels: {
      enabled: true,
      style: {
        fontFamily: "Inter, sans-serif",
      },
    },
    legend: {
      position: "bottom",
      fontFamily: "Inter, sans-serif",
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return value + " бр.";
        },
      },
    },
  };

  const chartComponent = useMemo(() => {
    return (
      <ReactApexChart
        options={chartOptions}
        series={chartOptions.series}
        type='pie'
        height={"100%"}
        width={"100%"}
      />
    );
  }, [props.data]);

  const [showSection, setShowSection] = useState(false);

  const handleShowSection = () => {
    setShowSection(!showSection);
  };

  return (
    <div className='bg-white rounded-md shadow-md p-4 md:p-5'>
      <div className='flex justify-between items-start w-full mb-5'>
        <div className='flex-col items-center w-full'>
          <h5 className='text-xl font-bold leading-none text-gray-800 me-1 mb-1'>
            Продажби по бутилки
          </h5>

          {props.status && (
            <div className='bg-gray-50 p-3 rounded-lg'>
              <div
                className={`grid ${
                  props.data.length > 1 && "sm:grid-cols-2"
                } grid-cols-1  gap-3 mb-2`}>
                {props.data.map((stat, index) => (
                  <dl
                    key={index}
                    className={`bg-${pieChartBoxColor[index]}-50 rounded-lg flex flex-col items-center justify-center h-[78px]`}>
                    <dt
                      className={`w-8 h-8 rounded-full bg-${pieChartBoxColor[index]}-100 text-${pieChartBoxColor[index]}-600 text-sm font-semibold flex items-center justify-center mb-1`}>
                      {stat.total_quantity}
                    </dt>

                    <dd
                      className={`text-${pieChartBoxColor[index]}-600 text-sm font-semibold`}>
                      {stat.name + " " + stat.weight + "гр."}
                    </dd>
                  </dl>
                ))}
              </div>

              <button
                onClick={handleShowSection}
                className='hover:underline text-sm text-gray-500 font-medium inline-flex items-center transition-all'>
                Покажи детайли{" "}
                <IoIosArrowDown
                  className={`${
                    showSection && "rotate-180"
                  } w-4 h-4 ml-1 mt-1 transition-all`}
                />
              </button>

              {showSection && (
                <div className='border-gray-200 border-t pt-3 mt-3 space-y-2'>
                  <dl className='flex items-center justify-between font-medium'>
                    <dt className='text-gray-500 text-sm'>Брой доставки:</dt>

                    <dd className='bg-gray-100 text-gray-800 text-xs inline-flex items-center px-2.5 py-1 rounded-md'>
                      {totalSalesCount}
                    </dd>
                  </dl>

                  <dl className='flex items-center justify-between font-medium'>
                    <dt className='text-gray-500 text-sm'>
                      Брой продадени кашона:
                    </dt>

                    <dd className='bg-gray-100 text-gray-800 text-xs inline-flex items-center px-2.5 py-1 rounded-md'>
                      {(totalBottleCount / 6).toFixed(1)}
                    </dd>
                  </dl>

                  <dl className='flex items-center justify-between font-medium'>
                    <dt className='text-gray-500 text-sm'>
                      Брой продадени бутилки:
                    </dt>

                    <dd className='bg-gray-100 text-gray-800 text-xs inline-flex items-center px-2.5 py-1 rounded-md'>
                      {totalBottleCount}
                    </dd>
                  </dl>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={props.status ? "h-80" : "h-[28.4rem]"}>
        {props.data?.length > 0 ? (
          chartComponent
        ) : !props.data?.length && !props.status && props.message ? (
          <div className='h-full w-full flex items-center justify-center font-semibold text-slate-700 text-center'>
            {props.message}
          </div>
        ) : (
          <div className='h-full w-full flex items-center justify-center font-semibold text-slate-700 text-center'>
            <Spinner classNames={{ wrapper: "w-20 h-20" }} />
          </div>
        )}
      </div>

      <div className='grid grid-cols-1 items-center border-gray-200 border-t justify-between'>
        <div className='flex justify-between items-center pt-5'>
          <Dropdown>
            <DropdownTrigger>
              <button
                className='text-sm font-medium text-gray-500 text-center inline-flex items-center focus:outline-none'
                type='button'>
                {pieChartPeriod}

                <IoIosArrowDown className='w-4 h-4 ml-1 mt-1' />
              </button>
            </DropdownTrigger>

            <DropdownMenu
              aria-label='Static Actions'
              selectionMode='single'
              disallowEmptySelection
              selectedKeys={pieChartPeriod}
              onSelectionChange={setPieChartPeriod}>
              {dropdownPeriods.map((period) => (
                <DropdownItem
                  key={period}
                  eventKey={period}>
                  {period}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default Pie;
