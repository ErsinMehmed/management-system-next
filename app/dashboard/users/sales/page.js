"use client";
import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import Layout from "@/components/layout/Dashboard";
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
  DateRangePicker,
} from "@nextui-org/react";
import { formatCurrency } from "@/utils";
import { userStore } from "@/stores/useStore";
import { parseDate } from "@internationalized/date";

const UserSales = () => {
  const { userSales, loadUserSales } = userStore;

  const [value, setValue] = React.useState({
    start: parseDate("2024-04-01"),
    end: parseDate("2024-04-08"),
  });

  useEffect(() => {
    loadUserSales();
  }, [loadUserSales]);

  // Функция за изчисляване на общите стойности
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
      return {
        ...data,
        totalQuantity,
        totalPrice: totalPrice.toFixed(2),
      };
    });
  };

  const userSalesWithTotals = calculateTotals(userSales.sales || []);

  const itemClasses = {
    base: "py-0 w-full",
    title: "font-normal text-medium",
    trigger:
      "py-0 px-2 data-[hover=true]:bg-default-100 rounded-lg h-14 flex items-center",
    indicator: "text-medium",
    content: "text-small",
  };

  const defaultContent =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

  const salesTableHeaders = ["ИМЕ", "КОЛИЧЕСТВО", "ПРИХОДИ", "РАЗХОДИ"];

  return (
    <Layout title="Продажби по потребители">
      <div>
        <DateRangePicker
          label="Date range (controlled)"
          value={value}
          onChange={setValue}
        />
      </div>
      {userSalesWithTotals.map((data, index) => (
        <Card key={index} className="max-w-[550px]">
          <CardHeader className="flex gap-3 ml-3 mt-1">
            <Avatar isBordered radius="md" src={data.user_profile_image} />

            <div className="flex flex-col">
              <p className="text-md text-slate-700 font-semibold">
                {data.user_name}
              </p>

              <p className="text-small text-default-500">{data.user_role}</p>
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
                      {data?.total_bottles} бр.
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
                          {product.name + " " + product.weight}гр.
                        </TableCell>

                        <TableCell>{product.total_quantity} бр.</TableCell>

                        <TableCell>
                          {formatCurrency(product.total_price)} лв.
                        </TableCell>

                        <TableCell>
                          {formatCurrency(product.total_cost)} лв.
                        </TableCell>
                      </TableRow>
                    ))}

                    <TableRow>
                      <TableCell className="font-semibold">ОБЩО:</TableCell>

                      <TableCell></TableCell>

                      <TableCell className="font-semibold">
                        {data.totalQuantity} бр.
                      </TableCell>

                      <TableCell className="font-semibold">
                        {formatCurrency(data.totalPrice)} лв.
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </AccordionItem>

              <AccordionItem
                key="3"
                aria-label="Наличности"
                startContent={<BsBox className="size-7" />}
                subtitle="налични бутилки...... {бройки}"
                title="Наличности"
              >
                {defaultContent}
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
                    <TableColumn>Тип</TableColumn>
                    <TableColumn>Сума</TableColumn>
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
                {defaultContent}
              </AccordionItem>
            </Accordion>
          </CardBody>
        </Card>
      ))}
    </Layout>
  );
};

export default observer(UserSales);
