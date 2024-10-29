import React from "react";
import {
  Accordion,
  AccordionItem,
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { observer } from "mobx-react-lite";
import {
  BsBox,
  BsCart2,
  BsCashCoin,
  BsGraphUp,
  BsInfoCircle,
} from "react-icons/bs";
import { userStore, expenseStore, incomeStore } from "@/stores/useStore";
import { formatCurrency } from "@/utils";
import UserInfo from "@/components/pages/users/UserInfo";
import SalesTable from "@/components/pages/users/tables/SalesTable";
import StockTable from "@/components/pages/users/tables/StockTable";
import ExpensesTable from "@/components/pages/users/tables/ExpensesTable";
import ProfitTable from "@/components/pages/users/tables/ProfitTable";

const UserCard = () => {
  const { userSales } = userStore;
  const { saleIncomes } = incomeStore;
  const { productExpenses, fuelExpenses, additionalExpenses } = expenseStore;

  const calculateTotals = (salesData) => {
    return salesData.map((data) => {
      const totalQuantity = data.products.reduce(
        (acc, product) => acc + product.total_quantity,
        0
      );

      const totalPrice = data.products.reduce(
        (acc, product) => acc + product.total_price,
        0
      );

      const totalExpenses = data.products.reduce(
        (acc, product) => acc + product.total_cost,
        0
      );

      return {
        ...data,
        totalQuantity,
        totalPrice: totalPrice.toFixed(2),
        totalExpenses: totalExpenses,
      };
    });
  };

  const calculateTotalStock = (userStocks) => {
    return userStocks.reduce((acc, product) => acc + product.stock, 0);
  };

  const userSalesWithTotals = calculateTotals(userSales.sales || []).map(
    (data) => ({
      ...data,
      totalStock: calculateTotalStock(data.user_stocks),
    })
  );

  const calculateTargetPercentage = (target, sold) => {
    if (target === 0) return 0;

    return ((sold / target) * 100).toFixed(2);
  };

  const totalProfit =
    saleIncomes - (additionalExpenses + fuelExpenses + productExpenses);

  const itemClasses = {
    base: "py-0 w-full",
    title: "font-normal text-medium",
    trigger:
      "py-0 px-2 data-[hover=true]:bg-default-100 rounded-lg h-14 flex items-center",
    indicator: "text-medium",
    content: "text-small",
  };

  return userSalesWithTotals.map((data, index) => (
    <Card key={index} className="w-full lg:max-w-[550px]">
      <UserInfo user={data} />

      <CardBody>
        <Accordion
          showDivider={false}
          className="p-2 w-full"
          itemClasses={itemClasses}
        >
          <AccordionItem
            key="1"
            aria-label="Обща информация"
            startContent={<BsInfoCircle className="size-7" />}
            subtitle="Информация за потребителят"
            title="Обща информация"
          >
            {calculateTargetPercentage(data.user_target, data.total_bottles)}
          </AccordionItem>

          <AccordionItem
            key="2"
            aria-label="Продажби"
            startContent={<BsCart2 className="size-7" />}
            subtitle={
              <p className="flex">
                Продадени бутилки
                <span className="font-semibold ml-1">
                  {data.total_bottles} бр.
                </span>
              </p>
            }
            title="Продажби"
          >
            <SalesTable
              products={data.products}
              totalQuantity={data.totalQuantity}
              totalPrice={data.totalPrice}
              totalExpenses={data.totalExpenses}
            />
          </AccordionItem>

          <AccordionItem
            key="3"
            aria-label="Наличности"
            startContent={<BsBox className="size-7" />}
            subtitle={
              <p className="flex">
                Налични бутилки
                <span className="font-semibold ml-1">
                  {data.totalStock} бр.
                </span>
              </p>
            }
            title="Наличности"
          >
            <StockTable
              stocks={data.user_stocks}
              totalStock={data.totalStock}
            />
          </AccordionItem>

          <AccordionItem
            key="4"
            aria-label="Разходи"
            startContent={<BsCashCoin className="size-7" />}
            subtitle="За посоченият период"
            title="Разходи"
          >
            <ExpensesTable fuelPrice={fuelExpenses} />
          </AccordionItem>

          <AccordionItem
            key="5"
            aria-label="Печалба"
            startContent={<BsGraphUp className="size-7" />}
            subtitle="За посоченият период"
            title="Печалба"
          >
            <ProfitTable
              saleIncomes={saleIncomes}
              productExpenses={productExpenses}
              fuelExpenses={fuelExpenses}
              additionalExpenses={additionalExpenses}
              totalProfit={totalProfit}
              userPercent={data.user_percent}
            />
          </AccordionItem>
        </Accordion>
      </CardBody>
    </Card>
  ));
};

export default observer(UserCard);
