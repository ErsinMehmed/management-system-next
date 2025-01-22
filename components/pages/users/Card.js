import React from "react";
import {
  Accordion,
  AccordionItem,
  Card,
  CardBody,
  Progress,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@heroui/react";
import { observer } from "mobx-react-lite";
import {
  BsBox,
  BsCart2,
  BsCashCoin,
  BsGraphUp,
  BsInfoCircle,
} from "react-icons/bs";
import { FaCircleInfo } from "react-icons/fa6";
import { userStore, expenseStore, incomeStore } from "@/stores/useStore";
import UserInfo from "@/components/pages/users/UserInfo";
import SalesTable from "@/components/pages/users/tables/SalesTable";
import StockTable from "@/components/pages/users/tables/StockTable";
import ExpensesTable from "@/components/pages/users/tables/ExpensesTable";
import ProfitTable from "@/components/pages/users/tables/ProfitTable";

const InfoButton = ({ message }) => (
  <>
    <Tooltip content={message}>
      <button className="text-slate-600 ml-1.5 invisible sm:visible">
        <FaCircleInfo />
      </button>
    </Tooltip>

    <Popover placement="right">
      <PopoverTrigger>
        <button className="text-slate-600 -ml-2.5 sm:hidden">
          <FaCircleInfo />
        </button>
      </PopoverTrigger>
      <PopoverContent>{message}</PopoverContent>
    </Popover>
  </>
);

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

  const CustomUserTargetLabel = ({ message }) => (
    <span>
      Продажби - таргет <InfoButton message={message} />
    </span>
  );

  const UserTooltipText = ({ totalBottleSales, userTarget }) => {
    const remainingBottles = userTarget - totalBottleSales;
    const displayRemainingBottles =
      remainingBottles < 0
        ? `+${Math.abs(remainingBottles)}`
        : remainingBottles;

    return (
      <div className="flex flex-col gap-y-1.5">
        <div>
          Продадени бутилки{" "}
          <span className="font-semibold">{totalBottleSales} бр.</span>
        </div>

        <div>
          Таргет <span className="font-semibold">{userTarget} бр.</span>
        </div>

        <div>
          Оставащи бутилки{" "}
          <span className="font-semibold">{displayRemainingBottles} бр.</span>
        </div>
      </div>
    );
  };

  return userSalesWithTotals.map((data, index) => {
    const targetPercentage = calculateTargetPercentage(
      data.user_target,
      data.total_bottles
    );
    const isTargetAchieved = targetPercentage >= 100;

    return (
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
              <div
                className={`p-2.5 ${
                  isTargetAchieved ? "bg-green-100 shadow-md rounded-xl" : ""
                }`}
              >
                <Progress
                  size="sm"
                  radius="sm"
                  classNames={{
                    track: "drop-shadow-md",
                    indicator: isTargetAchieved
                      ? ""
                      : "bg-gradient-to-r from-violet-500 to-sky-500",
                    label: "tracking-wider font-medium text-default-600",
                    value: `font-semibold ${
                      isTargetAchieved ? "text-green-600" : "text-foreground/60"
                    }`,
                  }}
                  color={isTargetAchieved ? "success" : undefined}
                  label={
                    <CustomUserTargetLabel
                      message={
                        <UserTooltipText
                          totalBottleSales={data.total_bottles}
                          userTarget={data.user_target}
                        />
                      }
                    />
                  }
                  value={targetPercentage}
                  showValueLabel={true}
                />
              </div>
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
    );
  });
};

export default observer(UserCard);
