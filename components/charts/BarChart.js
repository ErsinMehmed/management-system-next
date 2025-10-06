import dynamic from "next/dynamic";
import { incomeStore } from "@/stores/useStore";
import { Spinner } from "@heroui/react";
import { formatCurrency } from "@/utils";

const BarChart = () => {
  const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
  });
  const { averageProfitData, isLoadingAverageProfit } = incomeStore;
  const { profitResults } = averageProfitData;

  const transformedData = profitResults?.map((item) => ({
    x: item.productName,
    y: item.averageProfit,
  }));

  const options = {
    colors: ["#1A56DB", "#FDBA8C"],
    series: [
      {
        name: "Средна печалба",
        color: "#1A56DB",
        data: transformedData,
      },
    ],
    chart: {
      type: "bar",
      fontFamily: "Inter, sans-serif",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "80%",
        borderRadiusApplication: "end",
        borderRadius: 8,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      style: {
        fontFamily: "Inter, sans-serif",
      },
    },
    states: {
      hover: {
        filter: {
          type: "darken",
          value: 1,
        },
      },
    },
    stroke: {
      show: true,
      width: 0,
      colors: ["transparent"],
    },
    grid: {
      show: true,
      strokeDashArray: 4,
      padding: {
        left: 2,
        right: 2,
        top: -14,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (value) {
        return value + " лв";
      },
    },
    legend: {
      show: false,
    },
    xaxis: {
      floating: false,
      labels: {
        show: true,
        style: {
          fontFamily: "Inter, sans-serif",
          cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
        },
      },
    },
    yaxis: {
      show: true,
      labels: {
        formatter: function (value) {
          return value + " лв.";
        },
      },
    },
    fill: {
      opacity: 1,
    },
  };

  return (
    <div className='bg-white rounded-md shadow-md mt-5 2xl:mt-0'>
      <div className='px-5 py-4 border-b border-slate-100'>
        <div className='ml-4 md:ml-5 text-xl font-semibold leading-none text-slate-800'>
          Средна печалба по бутилка
        </div>
      </div>

      <div className='px-4 pb-4 md:px-5 md:pb-5'>
        <div className='grid md:grid-cols-2 ml-4 md:ml-5 py-3.5'>
          <div className='flex items-center'>
            <div className='text-gray-500 font-semibold me-1'>
              Средна печалба на бутилка:
            </div>

            <div className='text-gray-900 font-semibold'>
              {averageProfitData.averageProfitOverall}лв.
            </div>
          </div>

          <div className='flex items-center mt-2.5 md:mt-0'>
            <div className='text-gray-500 font-semibold mr-1 md:ml-5'>
              Обща печалба:
            </div>

            <div className='text-gray-900 font-semibold'>
              {formatCurrency(averageProfitData.totalProfit)}
            </div>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <div className='min-w-[850px] h-80 md:h-96 overflow-y-hidden'>
            {isLoadingAverageProfit ? (
              <div className='h-full w-full center-element font-semibold text-slate-700 text-center'>
                <Spinner classNames={{ wrapper: "w-20 h-20" }} />
              </div>
            ) : profitResults?.length === 0 ? (
              <p className='h-full w-full center-element font-semibold text-slate-700 text-center'>
                Няма намерени данни
              </p>
            ) : (
              <ReactApexChart
                options={options}
                series={options.series}
                type='bar'
                height={"100%"}
                width={"100%"}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarChart;
