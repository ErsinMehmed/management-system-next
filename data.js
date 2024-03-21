import { BsBox, BsCart2, BsTruck, BsHouse, BsMegaphone } from "react-icons/bs";

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

const categories = ["Бутилки", "Балони", "Накрайници"];

const dashboardLinks = [
  {
    link: "/dashboard",
    text: "Табло",
    icon: <BsHouse className='w-5 h-5' />,
  },
  {
    link: "/dashboard/orders",
    text: "Поръчки",
    icon: <BsTruck className='w-5 h-5' />,
  },
  {
    link: "/dashboard/products",
    text: "Продукти",
    icon: <BsBox className='w-5 h-5' />,
  },
  {
    link: "/dashboard/sales",
    text: "Продажби",
    icon: <BsCart2 className='w-5 h-5' />,
  },
  {
    link: "/dashboard/ads",
    text: "Реклами",
    icon: <BsMegaphone className='w-5 h-5' />,
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
