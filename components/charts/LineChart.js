import dynamic from "next/dynamic";
import { sellStore } from "@/stores/useStore";

import { Spinner } from "@heroui/react";

const LineChart = (props) => {
  const { lineChartSaleStats, isLoadingLineChartStats } = sellStore;
  const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
  });

  const series = lineChartSaleStats?.data;

  const options = {
    chart: {
      fontFamily: "Inter, sans-serif",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    tooltip: {
      enabled: true,
      x: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "bottom",
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.45,
        opacityTo: 0,
        shade: "#1C64F2",
        gradientToColors: ["#1C64F2"],
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: lineChartSaleStats?.periods,
      labels: {
        show: true,
      },
      axisBorder: {
        show: true,
      },
      axisTicks: {
        show: true,
      },
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return value + " бр.";
        },
      },
    },
  };

  return (
    <div className='bg-white rounded-md shadow-md '>
      <div className='px-5 py-4 border-b border-slate-100'>
        <div className='ml-4 md:ml-5 text-xl font-semibold leading-none text-slate-700'>
          Продажби на бутилки за посоченият период
        </div>
      </div>

      <div className='overflow-x-auto p-4 md:p-5'>
        <div className='min-w-[800px] h-80 md:h-96 overflow-y-hidden'>
          {isLoadingLineChartStats ? (
            <div className='h-full w-full center-element font-semibold text-slate-700 text-center'>
              <Spinner classNames={{ wrapper: "w-20 h-20" }} />
            </div>
          ) : lineChartSaleStats?.data ? (
            <ReactApexChart
              options={options}
              series={series}
              type='area'
              height={"100%"}
              width={"100%"}
            />
          ) : (
            <p className='h-full w-full center-element font-semibold text-slate-700 text-center'>
              Няма намерени данни
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LineChart;
