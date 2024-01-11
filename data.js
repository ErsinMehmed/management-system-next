import { BsBox, BsCart2, BsTruck, BsHouse, BsMegaphone } from "react-icons/bs";

const perPageResult = [5, 10, 15, 20];

const periods = [
  "Днес",
  "Вчера",
  "Последните 7 дни",
  "Последният месец",
  "Последните 3 месеца",
  "Последните 6 месеца",
  "Последната година",
];

const dashboardLinks = [
  {
    link: "/dashboard",
    text: "Табло",
    icon: <BsHouse className="w-5 h-5" />,
  },
  {
    link: "/dashboard/orders",
    text: "Поръчки",
    icon: <BsTruck className="w-5 h-5" />,
  },
  {
    link: "/dashboard/stocks",
    text: "Наличности",
    icon: <BsBox className="w-5 h-5" />,
  },
  {
    link: "/dashboard/sales",
    text: "Продажби",
    icon: <BsCart2 className="w-5 h-5" />,
  },
  {
    link: "/dashboard/ads",
    text: "Реклами",
    icon: <BsMegaphone className="w-5 h-5" />,
  },
];

export { periods, perPageResult, dashboardLinks };
