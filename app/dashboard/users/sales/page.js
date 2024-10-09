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
  Avatar,
} from "@nextui-org/react";
import { productTitle } from "@/utils";
import { userStore } from "@/stores/useStore";

const UserSales = () => {
  const { userSales, loadUserSales } = userStore;
  console.log(userSales.sales);
  useEffect(() => {
    loadUserSales();
  }, [loadUserSales]);

  const itemClasses = {
    base: "py-0 w-full",
    title: "font-normal text-medium",
    trigger:
      "py-0 data-[hover=true]:bg-default-100 rounded-lg h-14 flex items-center",
    indicator: "text-medium",
    content: "text-small",
  };

  const defaultContent =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

  return (
    <Layout title="Продажби по потребители">
      {userSales.sales?.map((data, index) => (
        <Card key={index} className="max-w-[450px]">
          <CardHeader className="flex gap-3">
            <Avatar isBordered radius="md" src={data.profile_image} />

            <div className="flex flex-col">
              <p className="text-md text-slate-700 font-semibold">
                {data.user}
              </p>

              <p className="text-small text-default-500">{data.role}</p>
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
                title="Продажби"
              >
                {defaultContent}
              </AccordionItem>

              <AccordionItem
                key="2"
                aria-label="Продажби"
                startContent={<BsCart2 className="size-7" />}
                subtitle={
                  <p className="flex">
                    Продадени бутилки
                    <span className="font-semibold ml-1">
                      {data?.total_bottles}бр.
                    </span>
                  </p>
                }
                title="Продажби"
              >
                {defaultContent}
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
                subtitle="За гориво"
                title="Оборот"
              >
                {defaultContent}
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
