import { BsBox, BsCart2, BsTruck, BsHouse } from "react-icons/bs";

const socialPlatforms = [{ value: "Facebook" }, { value: "Instagram" }];

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
    role: ["Admin", "Seller"],
    icon: <BsHouse className='w-5 h-5' />,
  },
  {
    link: "/dashboard/orders",
    text: "Поръчки",
    role: ["Admin"],
    icon: <BsTruck className='w-5 h-5' />,
  },
  {
    link: "/dashboard/products",
    text: "Продукти",
    role: ["Admin"],
    icon: <BsBox className='w-5 h-5' />,
  },
  {
    link: "/dashboard/sales",
    text: "Продажби",
    role: ["Admin", "Seller"],
    icon: <BsCart2 className='w-5 h-5' />,
  },
];

export {
  periods,
  dropdownPeriods,
  perPageResult,
  dashboardLinks,
  categories,
  socialPlatforms,
};
