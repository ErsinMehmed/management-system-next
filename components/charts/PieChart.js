"use client";
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sellStore } from "@/stores/useStore";
import { FaInfoCircle } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import dynamic from "next/dynamic";

const Pie = (props) => {
  const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
  });

  const { pieChartPeriod, setPieChartPeriod } = sellStore;

  const pieChartBoxColor = ["blue", "purple"];

  const seriesData = [];
  const labels = [];

  if (props.status) {
    props.data.forEach((item) => {
      seriesData.push(item.total_quantity);
    });

    props.data.forEach((item) => {
      labels.push(item.name + " " + item.weight + "гр.");
    });
  }

  const chartOptions = {
    series: seriesData,
    colors: ["#1C64F2", "#9061F9"],
    chart: {
      height: 420,
      width: "100%",
      type: "pie",
    },
    stroke: {
      colors: ["white"],
      lineCap: "",
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
          return value + "%";
        },
      },
    },
    xaxis: {
      labels: {
        formatter: function (value) {
          return value + "%";
        },
      },
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
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
    <div className="max-w-sm w-full bg-white rounded-lg shadow p-4 md:p-6">
      <div className="flex justify-between items-start w-full">
        <div className="flex-col items-center w-full">
          <div className="flex items-center mb-1">
            <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white me-1">
              Продажби на бутилки
            </h5>

            <FaInfoCircle className="text-gray-600 w-4 h-4 mt-0.5 ml-0.5" />
          </div>

          {props.status && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className={`grid grid-cols-${props.data.length} gap-3 mb-2`}>
                {props.data.map((stat, index) => (
                  <dl
                    key={index}
                    className={`bg-${pieChartBoxColor[index]}-50 rounded-lg flex flex-col items-center justify-center h-[78px]`}
                  >
                    <dt
                      className={`w-8 h-8 rounded-full bg-${pieChartBoxColor[index]}-100 text-${pieChartBoxColor[index]}-600 text-sm font-semibold flex items-center justify-center mb-1`}
                    >
                      {stat.total_quantity}
                    </dt>
                    <dd
                      className={`text-${pieChartBoxColor[index]}-600 text-sm font-semibold`}
                    >
                      {stat.name + " " + stat.weight + "гр."}
                    </dd>
                  </dl>
                ))}
              </div>

              <button
                onClick={handleShowSection}
                className="hover:underline text-sm text-gray-500 font-medium inline-flex items-center transition-all"
              >
                Покажи детайли <IoIosArrowDown className="w-4 h-4 ml-1 mt-1" />
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
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                    className="border-gray-200 border-t pt-3 mt-3 space-y-2 hidden"
                  >
                    <dl className="flex items-center justify-between">
                      <dt className="text-gray-500 dark:text-gray-400 text-sm font-normal">
                        Average task completion rate:
                      </dt>
                      <dd className="bg-green-100 text-green-800 text-xs font-medium inline-flex items-center px-2.5 py-1 rounded-md dark:bg-green-900 dark:text-green-300">
                        <svg
                          className="w-2.5 h-2.5 me-1.5"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 10 14"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13V1m0 0L1 5m4-4 4 4"
                          />
                        </svg>{" "}
                        57%
                      </dd>
                    </dl>
                    <dl className="flex items-center justify-between">
                      <dt className="text-gray-500 dark:text-gray-400 text-sm font-normal">
                        Days until sprint ends:
                      </dt>
                      <dd className="bg-gray-100 text-gray-800 text-xs font-medium inline-flex items-center px-2.5 py-1 rounded-md dark:bg-gray-600 dark:text-gray-300">
                        13 days
                      </dd>
                    </dl>
                    <dl className="flex items-center justify-between">
                      <dt className="text-gray-500 dark:text-gray-400 text-sm font-normal">
                        Next meeting:
                      </dt>
                      <dd className="bg-gray-100 text-gray-800 text-xs font-medium inline-flex items-center px-2.5 py-1 rounded-md dark:bg-gray-600 dark:text-gray-300">
                        Thursday
                      </dd>
                    </dl>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <div className={props.status ? "h-80" : "h-[28.35rem]"}>
        {props.status ? (
          chartComponent
        ) : (
          <div className="h-full w-full flex items-center justify-center font-semibold text-slate-700 text-center">
            {props.message}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 items-center border-gray-200 border-t dark:border-gray-700 justify-between">
        <div className="flex justify-between items-center pt-5">
          <Dropdown>
            <DropdownTrigger>
              <button
                className="text-sm font-medium text-gray-500 text-center inline-flex items-center active:outline-none"
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
              <DropdownItem key="Днес">Днес</DropdownItem>
              <DropdownItem key="Вчера">Вчера</DropdownItem>
              <DropdownItem key="Последните 7 дни">
                Последните 7 дни
              </DropdownItem>
              <DropdownItem key="Последният месец">
                Последният месец
              </DropdownItem>
              <DropdownItem key="Последните 3 месеца">
                Последните 3 месеца
              </DropdownItem>
              <DropdownItem key="Последните 6 месеца">
                Последните 6 месеца
              </DropdownItem>
              <DropdownItem key="Последната година">
                Последната година
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default Pie;
