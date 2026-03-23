import React, { memo } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionHeading,
  AccordionTrigger,
  AccordionPanel,
  AccordionBody,
  AccordionIndicator,
  Card,
  Tooltip,
  Popover,
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
    <Tooltip>
      <Tooltip.Trigger asChild>
        <button className="text-slate-600 ml-1.5 invisible sm:visible">
          <FaCircleInfo />
        </button>
      </Tooltip.Trigger>
      <Tooltip.Content>{message}</Tooltip.Content>
    </Tooltip>

    <Popover placement="right">
      <Popover.Trigger>
        <button className="text-slate-600 -ml-2.5 sm:hidden">
          <FaCircleInfo />
        </button>
      </Popover.Trigger>
      <Popover.Content>{message}</Popover.Content>
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

        <Card.Content className="p-2">
          <Accordion className="w-full">
            <AccordionItem>
              <AccordionHeading>
                <AccordionTrigger className="py-0 px-2 hover:bg-default-100 rounded-lg h-14 flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <BsInfoCircle className="size-7" />
                    <div className="text-left">
                      <div className="font-normal text-medium">Обща информация</div>
                      <div className="text-sm text-default-500">Информация за потребителят</div>
                    </div>
                  </div>
                  <AccordionIndicator />
                </AccordionTrigger>
              </AccordionHeading>
              <AccordionPanel>
                <AccordionBody className="text-small">
                  <div
                    className={`p-2.5 ${
                      isTargetAchieved ? "bg-green-100 shadow-md rounded-xl" : ""
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <CustomUserTargetLabel
                          message={
                            <UserTooltipText
                              totalBottleSales={data.total_bottles}
                              userTarget={data.user_target}
                            />
                          }
                        />
                        <span className={`font-semibold text-sm ${isTargetAchieved ? "text-green-600" : "text-foreground/60"}`}>
                          {targetPercentage}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isTargetAchieved ? "bg-green-500" : "bg-gradient-to-r from-violet-500 to-sky-500"}`}
                          style={{ width: `${Math.min(Number(targetPercentage), 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </AccordionBody>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <AccordionHeading>
                <AccordionTrigger className="py-0 px-2 hover:bg-default-100 rounded-lg h-14 flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <BsCart2 className="size-7" />
                    <div className="text-left">
                      <div className="font-normal text-medium">Продажби</div>
                      <p className="text-sm text-default-500 flex">
                        Продадени бутилки
                        <span className="font-semibold ml-1">
                          {data.total_bottles} бр.
                        </span>
                      </p>
                    </div>
                  </div>
                  <AccordionIndicator />
                </AccordionTrigger>
              </AccordionHeading>
              <AccordionPanel>
                <AccordionBody className="text-small">
                  <SalesTable
                    products={data.products}
                    totalQuantity={data.totalQuantity}
                    totalPrice={data.totalPrice}
                    totalExpenses={data.totalExpenses}
                  />
                </AccordionBody>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <AccordionHeading>
                <AccordionTrigger className="py-0 px-2 hover:bg-default-100 rounded-lg h-14 flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <BsBox className="size-7" />
                    <div className="text-left">
                      <div className="font-normal text-medium">Наличности</div>
                      <p className="text-sm text-default-500 flex">
                        Налични бутилки
                        <span className="font-semibold ml-1">
                          {data.totalStock} бр.
                        </span>
                      </p>
                    </div>
                  </div>
                  <AccordionIndicator />
                </AccordionTrigger>
              </AccordionHeading>
              <AccordionPanel>
                <AccordionBody className="text-small">
                  <StockTable
                    stocks={data.user_stocks}
                    totalStock={data.totalStock}
                  />
                </AccordionBody>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <AccordionHeading>
                <AccordionTrigger className="py-0 px-2 hover:bg-default-100 rounded-lg h-14 flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <BsCashCoin className="size-7" />
                    <div className="text-left">
                      <div className="font-normal text-medium">Разходи</div>
                      <div className="text-sm text-default-500">За посоченият период</div>
                    </div>
                  </div>
                  <AccordionIndicator />
                </AccordionTrigger>
              </AccordionHeading>
              <AccordionPanel>
                <AccordionBody className="text-small">
                  <ExpensesTable fuelPrice={fuelExpenses} />
                </AccordionBody>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <AccordionHeading>
                <AccordionTrigger className="py-0 px-2 hover:bg-default-100 rounded-lg h-14 flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <BsGraphUp className="size-7" />
                    <div className="text-left">
                      <div className="font-normal text-medium">Печалба</div>
                      <div className="text-sm text-default-500">За посоченият период</div>
                    </div>
                  </div>
                  <AccordionIndicator />
                </AccordionTrigger>
              </AccordionHeading>
              <AccordionPanel>
                <AccordionBody className="text-small">
                  <ProfitTable
                    saleIncomes={saleIncomes}
                    productExpenses={productExpenses}
                    fuelExpenses={fuelExpenses}
                    additionalExpenses={additionalExpenses}
                    totalProfit={totalProfit}
                    userPercent={data.user_percent}
                  />
                </AccordionBody>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Card.Content>
      </Card>
    );
  });
};

export default memo(observer(UserCard));
