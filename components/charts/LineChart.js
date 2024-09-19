import ReactApexChart from "react-apexcharts";

const LineChart = (props) => {
  if (!props.data?.data) {
    return;
  }

  const series = props.data?.data;

  const options = {
    chart: {
      fontFamily: "Inter, sans-serif",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: 4,
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
        opacityFrom: 0.55,
        opacityTo: 0,
        shade: "#1C64F2",
        gradientToColors: ["#1C64F2"],
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: props.data?.periods,
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
    <div className='bg-white rounded-md shadow-md p-4 md:p-5'>
      <div className='px-5 py-4 border-b border-slate-100'>
        <div className='text-xl font-bold leading-none text-slate-800'>
          Продажби на бутилки за посоченият период
        </div>
      </div>

      <div className='overflow-x-auto'>
        <div className='min-w-[800px]'>
          <ReactApexChart
            options={options}
            series={series}
            type='area'
            height={400}
          />
        </div>
      </div>
    </div>
  );
};

export default LineChart;
