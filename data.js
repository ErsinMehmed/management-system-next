import {
  BsBox,
  BsCart2,
  BsTruck,
  BsHouse,
  BsPeople,
  BsCashCoin,
  BsClipboard,
} from "react-icons/bs";
import { FiPhone, FiTruck, FiXCircle } from "react-icons/fi";

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
  { value: "Всички резултати" },
];

const dropdownPeriods = [
  "Днес",
  "Вчера",
  "Последните 7 дни",
  "Последният месец",
  "Последните 3 месеца",
  "Последните 6 месеца",
  "Последната година",
  "Всички резултати",
];

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
    role: ["Super Admin", "Admin"],
    icon: <BsCart2 className='w-5 h-5' />,
  },
  {
    link: "/dashboard/incomes",
    text: "Приходи",
    role: ["Super Admin", "Admin"],
    icon: <BsCashCoin className='w-5 h-5' />,
  },
  {
    link: "/dashboard/client-orders",
    text: "Заявки",
    role: ["Super Admin", "Admin", "Seller"],
    icon: <BsClipboard className='w-5 h-5' />,
  },
  // {
  //   link: "/dashboard/users/sales",
  //   text: "Потребители",
  //   role: ["Super Admin", "Admin", "Seller"],
  //   icon: <BsPeople className="w-5 h-5" />,
  // },
];

const salesTableHeaders = ["ПРОДУКТ", "КОЛИЧЕСТВО", "ПРИХОДИ", "РАЗХОДИ"];

const clientOrderStatuses = ["нова", "доставена", "отказана"];

const clientOrderStatusConfig = {
  нова:      { badge: "bg-blue-100 text-blue-700",   accent: "bg-blue-500",   icon: FiPhone },
  доставена: { badge: "bg-green-100 text-green-700", accent: "bg-green-500",  icon: FiTruck },
  отказана:  { badge: "bg-red-100 text-red-700",     accent: "bg-red-500",    icon: FiXCircle },
};

export {
  periods,
  dropdownPeriods,
  perPageResult,
  dashboardLinks,
  salesTableHeaders,
  clientOrderStatuses,
  clientOrderStatusConfig,
};
