"use client";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import Layout from "@/components/layout/Dashboard";
import UserAviability from "@/components/pages/users/UserAviability";
import {
  BsBox,
  BsCart2,
  BsCashCoin,
  BsGraphUp,
  BsInfoCircle,
} from "react-icons/bs";
import {
  Accordion,
  AccordionItem,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
  Skeleton,
} from "@nextui-org/react";
import { formatCurrency } from "@/utils";
import DateRangePicker from "@/components/html/DateRangePicker";
import {
  userStore,
  commonStore,
  expenseStore,
  incomeStore,
} from "@/stores/useStore";
import { parseDate } from "@internationalized/date";
import moment from "moment";

const UserSales = () => {
  const {
    userSales,
    isUserSalesLoad,
    loadUserSales,
    loadUserStocks,
    loadUsers,
  } = userStore;
  const { saleIncomes, loadTotalSaleIncomes } = incomeStore;
  const {
    productExpenses,
    fuelExpenses,
    additionalExpenses,
    loadProductExpenses,
    loadFuelExpenses,
    loadAdditionalExpenses,
  } = expenseStore;
  const { successMessage, errorMessage } = commonStore;
  const [dateRange, setDateRange] = useState({
    start: parseDate(moment().subtract(7, "days").format("YYYY-MM-DD")),
    end: parseDate(moment().format("YYYY-MM-DD")),
  });

  const transformDateRange = (range) => {
    const formatDate = (dateObj) => {
      const year = dateObj.year;
      const month = String(dateObj.month).padStart(2, "0");
      const day = String(dateObj.day).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    return {
      dateFrom: formatDate(range.start),
      dateTo: formatDate(range.end),
    };
  };

  useEffect(() => {
    const period = transformDateRange(dateRange);

    loadUserSales(period);
    loadProductExpenses(period);
    loadTotalSaleIncomes(period);
    loadFuelExpenses(period);
    loadAdditionalExpenses(period);
    loadUsers();
  }, []);

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

  const handleDateChange = (newValue) => {
    const period = transformDateRange(newValue);
    setDateRange(newValue);
    loadUserSales(period);
    loadProductExpenses(period);
    loadTotalSaleIncomes(period);
    loadFuelExpenses(period);
    loadAdditionalExpenses(period);
  };

  const itemClasses = {
    base: "py-0 w-full",
    title: "font-normal text-medium",
    trigger:
      "py-0 px-2 data-[hover=true]:bg-default-100 rounded-lg h-14 flex items-center",
    indicator: "text-medium",
    content: "text-small",
  };

  const salesTableHeaders = ["ПРОДУКТ", "КОЛИЧЕСТВО", "ПРИХОДИ", "РАЗХОДИ"];

  const totalProfit =
    saleIncomes - (additionalExpenses + fuelExpenses + productExpenses);

  const calculatePercentage = (amount, percentage) => {
    return (amount * percentage) / 100;
  };

  return (
    <Layout title="Продажби по потребители">
      <div className="grid lg:grid-cols-2 xl:grid-cols-3">
        <div className="col-span-1 flex flex-col lg:flex-row items-center bg-white p-3 gap-3.5 w-full rounded-md shadow-md mb-5">
          <DateRangePicker
            label="Избери дата"
            value={dateRange}
            onChange={handleDateChange}
          />

          <UserAviability />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
        {isUserSalesLoad
          ? [...Array(4)].map((_, index) => (
              <Card key={index} className="w-full lg:max-w-[550px]">
                <CardHeader className="flex gap-3 ml-3 mt-1">
                  <Skeleton className="flex rounded-lg w-11 h-11" />

                  <div className="space-y-2.5">
                    <Skeleton className="h-2.5 w-32 rounded-lg" />
                    <Skeleton className="h-2.5 w-14 rounded-lg" />
                  </div>
                </CardHeader>

                <Divider />

                <CardBody>
                  <div className="p-3.5 space-y-[22px]">
                    {[...Array(5)].map((_, idx) => (
                      <div key={idx} className="flex items-center">
                        <Skeleton className="flex rounded-full w-9 h-9" />

                        <div className="space-y-2.5 ml-3">
                          <Skeleton className="h-2.5 w-32 rounded-lg" />
                          <Skeleton className="h-2.5 w-44 rounded-lg" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            ))
          : userSalesWithTotals.map((data, index) => (
              <Card key={index} className="w-full lg:max-w-[550px]">
                <CardHeader className="flex gap-3 ml-3 mt-1">
                  <Avatar
                    isBordered
                    radius="md"
                    src={data.user_profile_image}
                  />

                  <div className="flex flex-col">
                    <p className="text-md text-slate-700 font-semibold">
                      {data.user_name}
                    </p>

                    <p className="text-small text-default-500">
                      {data.user_role}
                    </p>
                  </div>
                </CardHeader>

                <Divider />

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
                      <div></div>
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
                      <Table isStriped>
                        <TableHeader>
                          {salesTableHeaders.map((text, index) => (
                            <TableColumn key={index}>{text}</TableColumn>
                          ))}
                        </TableHeader>

                        <TableBody>
                          {data.products.map((product, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                {product.name +
                                  " " +
                                  (product.name === "Балони"
                                    ? product.count + "бр."
                                    : product.weight + "гр.")}
                              </TableCell>

                              <TableCell>
                                {product.total_quantity} бр.
                              </TableCell>

                              <TableCell>
                                {formatCurrency(product.total_price)}
                              </TableCell>

                              <TableCell>
                                {formatCurrency(product.total_cost)}
                              </TableCell>
                            </TableRow>
                          ))}

                          {data.products.length > 1 && (
                            <TableRow>
                              <TableCell className="font-semibold">
                                ОБЩО:
                              </TableCell>

                              <TableCell className="font-semibold">
                                {data.totalQuantity} бр.
                              </TableCell>

                              <TableCell className="font-semibold">
                                {formatCurrency(data.totalPrice)}
                              </TableCell>

                              <TableCell className="font-semibold">
                                {formatCurrency(data.totalExpenses)}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
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
                      <Table isStriped>
                        <TableHeader>
                          <TableColumn>ПРОДУКТ</TableColumn>
                          <TableColumn>КОЛИЧЕСТВО</TableColumn>
                        </TableHeader>

                        <TableBody>
                          {data.user_stocks.map((product, index) => (
                            <TableRow key={index}>
                              <TableCell>{product.product_name}</TableCell>

                              <TableCell>{product.stock} бр.</TableCell>
                            </TableRow>
                          ))}

                          {data.user_stocks.length > 1 && (
                            <TableRow>
                              <TableCell className="font-semibold">
                                ОБЩО:
                              </TableCell>

                              <TableCell className="font-semibold">
                                {data.totalStock} бр.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </AccordionItem>

                    <AccordionItem
                      key="4"
                      aria-label="Разходи"
                      startContent={<BsCashCoin className="size-7" />}
                      subtitle="За посоченият период"
                      title="Разходи"
                    >
                      <Table isStriped>
                        <TableHeader>
                          <TableColumn>ТИП</TableColumn>
                          <TableColumn>СУМА</TableColumn>
                        </TableHeader>

                        <TableBody>
                          <TableRow>
                            <TableCell>Гориво</TableCell>
                            <TableCell>
                              {data.total_fuel_price.toFixed(2)} лв.
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </AccordionItem>

                    <AccordionItem
                      key="5"
                      aria-label="Печалба"
                      startContent={<BsGraphUp className="size-7" />}
                      subtitle="За посоченият период"
                      title="Печалба"
                    >
                      <Table isStriped>
                        <TableHeader>
                          <TableColumn>ТИП</TableColumn>
                          <TableColumn>СУМА</TableColumn>
                        </TableHeader>

                        <TableBody>
                          <TableRow>
                            <TableCell>Приходи</TableCell>

                            <TableCell>{formatCurrency(saleIncomes)}</TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell>Разходи за продукти</TableCell>

                            <TableCell>
                              {formatCurrency(productExpenses, 2)}
                            </TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell>Разходи за гориво</TableCell>

                            <TableCell>
                              {formatCurrency(fuelExpenses, 2)}
                            </TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell>Допълнителни разходи</TableCell>

                            <TableCell>
                              {formatCurrency(additionalExpenses)}
                            </TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell>Обща печалба</TableCell>

                            <TableCell>
                              {formatCurrency(totalProfit, 2)}
                            </TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell>КРАЙНА СУМА</TableCell>

                            <TableCell>
                              {formatCurrency(
                                calculatePercentage(
                                  totalProfit,
                                  data.user_percent
                                ),
                                2
                              )}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </AccordionItem>
                  </Accordion>
                </CardBody>
              </Card>
            ))}
      </div>
    </Layout>
  );
};

export default observer(UserSales);
