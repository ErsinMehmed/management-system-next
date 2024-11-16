import {
  BsBox,
  BsCart2,
  BsTruck,
  BsHouse,
  BsPeople,
  BsCashCoin,
} from "react-icons/bs";

const perPageResult = [
  { value: "5" },
  { value: "10" },
  { value: "15" },
  { value: "20" },
];

const periods = [
  { value: "Днес" },
  { value: "Вчера" },
  { value: "Последните 7 дни" },
  { value: "Последният месец" },
  { value: "Последните 3 месеца" },
  { value: "Последните 6 месеца" },
  { value: "Последната година" },
];

const dropdownPeriods = [
  "Днес",
  "Вчера",
  "Последните 7 дни",
  "Последният месец",
  "Последните 3 месеца",
  "Последните 6 месеца",
  "Последната година",
];

const categories = ["Бутилки", "Балони"];

const dashboardLinks = [
  {
    link: "/dashboard",
    text: "Табло",
    role: ["Super Admin", "Admin", "Seller"],
    icon: <BsHouse className='w-5 h-5' />,
  },
  {
    link: "/dashboard/orders",
    text: "Поръчки",
    role: ["Super Admin"],
    icon: <BsTruck className='w-5 h-5' />,
  },
  {
    link: "/dashboard/products",
    text: "Продукти",
    role: ["Super Admin", "Admin"],
    icon: <BsBox className='w-5 h-5' />,
  },
  {
    link: "/dashboard/sales",
    text: "Продажби",
    role: ["Super Admin", "Admin", "Seller"],
    icon: <BsCart2 className='w-5 h-5' />,
  },
  {
    link: "/dashboard/incomes",
    text: "Приходи",
    role: ["Super Admin", "Admin"],
    icon: <BsCashCoin className='w-5 h-5' />,
  },
  // {
  //   link: "/dashboard/users/sales",
  //   text: "Потребители",
  //   role: ["Super Admin", "Admin", "Seller"],
  //   icon: <BsPeople className="w-5 h-5" />,
  // },
];

const salesTableHeaders = ["ПРОДУКТ", "КОЛИЧЕСТВО", "ПРИХОДИ", "РАЗХОДИ"];

export {
  periods,
  dropdownPeriods,
  perPageResult,
  dashboardLinks,
  categories,
  salesTableHeaders,
};
