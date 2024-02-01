"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sellStore, commonStore, incomeStore } from "@/stores/useStore";
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

  const { incomes } = incomeStore;
  const { dashboardBoxPeriod } = commonStore;
  const { pieChartPeriod, setPieChartPeriod } = sellStore;

  let modifiedPieChartPeriod = "";

  if (pieChartPeriod.data_ instanceof Set && pieChartPeriod.data_.size > 0) {
    modifiedPieChartPeriod = pieChartPeriod.data_.values().next().value;
  }

  const pieChartBoxColors = ["blue", "amber", "emerald", "purple", "rose"];

  const seriesData = [];
  const labels = [];
  let totalSalesCount = null;
  let totalBottleCount = null;
  let totalCartonCount = null;

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

    totalCartonCount = props.data.reduce((accumulator, stat) => {
      if (stat.name === "Baking Bad" && stat.weight === 2200) {
        accumulator += stat.total_quantity / 4;
      } else {
        accumulator += stat.total_quantity / 6;
      }
      return accumulator;
    }, 0);
  }

  const chartOptions = {
    series: seriesData,
    colors: ["#60a5fa", "#fbbf24", "#34d399", "#c084fc", "#fb7185"],
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
        type="pie"
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
    <div className="bg-white rounded-md shadow-md p-4 md:p-5">
      <div className="flex justify-between items-start w-full mb-5">
        <div className="flex-col items-center w-full">
          <h5 className="text-xl font-bold leading-none text-gray-800 me-1 mb-3">
            Продажби по бутилки
          </h5>

          {props.status && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div
                className={`grid ${
                  props.data.length > 1 && "sm:grid-cols-2"
                } grid-cols-1  gap-3 mb-2`}
              >
                {props.data.map((stat, index) => (
                  <dl
                    key={index}
                    className={`bg-${pieChartBoxColors[index]}-50 rounded-lg center-element flex-col h-[78px]`}
                  >
                    <dt
                      className={`w-8 h-8 rounded-full bg-${pieChartBoxColors[index]}-100 text-${pieChartBoxColors[index]}-600 text-sm font-semibold center-element mb-1`}
                    >
                      {stat.total_quantity}
                    </dt>

                    <dd
                      className={`text-${pieChartBoxColors[index]}-600 text-sm font-semibold`}
                    >
                      {stat.name + " " + stat.weight + "гр."}
                    </dd>
                  </dl>
                ))}
              </div>

              <button
                onClick={handleShowSection}
                className={`hover:underline text-sm text-gray-500 font-medium inline-flex items-center transition-all ${
                  showSection && "mb-3.5"
                }`}
              >
                Покажи детайли{" "}
                <IoIosArrowDown
                  className={`${
                    showSection && "rotate-180"
                  } w-4 h-4 ml-1 mt-1 transition-all`}
                />
              </button>

              <AnimatePresence>
                {showSection && (
                  <motion.div
                    key="content"
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                      open: { opacity: 1, height: "auto" },
                      collapsed: { opacity: 0, height: 0 },
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="border-gray-200 border-t pt-3 space-y-2 overflow-hidden"
                  >
                    <dl className="flex-container font-medium">
                      <dt className="text-gray-500 text-sm">Брой доставки:</dt>

                      <dd className="income-display">{totalSalesCount}</dd>
                    </dl>

                    <dl className="flex-container font-medium">
                      <dt className="text-gray-500 text-sm">
                        Брой продадени кашона:
                      </dt>

                      <dd className="income-display">
                        {totalCartonCount.toFixed(1)}
                      </dd>
                    </dl>

                    <dl className="flex-container font-medium">
                      <dt className="text-gray-500 text-sm">
                        Брой продадени бутилки:
                      </dt>

                      <dd className="income-display">{totalBottleCount}</dd>
                    </dl>

                    {(modifiedPieChartPeriod
                      ? modifiedPieChartPeriod
                      : pieChartPeriod[0]) === dashboardBoxPeriod.period && (
                      <dl className="flex-container font-medium">
                        <dt className="text-gray-500 text-sm">
                          Средна продажна цена:
                        </dt>

                        <dd className="income-display">
                          {(incomes.incomes / totalBottleCount).toFixed(2)} лв.
                        </dd>
                      </dl>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <div className={props.status ? "h-80" : "h-[28.4rem]"}>
        {props.data?.length > 0 ? (
          chartComponent
        ) : !props.data?.length && !props.status && props.message ? (
          <div className="h-full w-full center-element font-semibold text-slate-700 text-center">
            {props.message}
          </div>
        ) : (
          <div className="h-full w-full center-element font-semibold text-slate-700 text-center">
            <Spinner classNames={{ wrapper: "w-20 h-20" }} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 items-center border-gray-200 border-t justify-between">
        <div className="flex justify-between items-center pt-5">
          <Dropdown>
            <DropdownTrigger>
              <button
                className="text-sm font-medium text-gray-500 text-center inline-flex items-center focus:outline-none"
                type="button"
              >
                {pieChartPeriod}

                <IoIosArrowDown className="w-4 h-4 ml-1 mt-1" />
              </button>
            </DropdownTrigger>

            <DropdownMenu
              aria-label="Static Actions"
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={pieChartPeriod}
              onSelectionChange={setPieChartPeriod}
            >
              {dropdownPeriods.map((period) => (
                <DropdownItem key={period} eventKey={period}>
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
