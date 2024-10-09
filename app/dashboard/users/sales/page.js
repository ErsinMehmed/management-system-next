"use client";
import React, { useEffect, useMemo } from "react";
import { MdAttachMoney } from "react-icons/md";
import { observer } from "mobx-react-lite";
import Layout from "@/components/layout/Dashboard";
import Modal from "@/components/Modal";
import Input from "@/components/html/Input";
import Table from "@/components/table/Table";
import Pagination from "@/components/table/Pagination";
import SellForm from "@/components/forms/Sell";
import {
  Accordion,
  AccordionItem,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Image,
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
      "px-2 py-0 data-[hover=true]:bg-default-100 rounded-lg h-14 flex items-center",
    indicator: "text-medium",
    content: "text-small px-2",
  };

  const defaultContent =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

  return (
    <Layout title="Продажби по потребители">
      {userSales.sales?.map((data) => (
        <Card className="max-w-[400px]">
          <CardHeader className="flex gap-3">
            <Image
              alt="nextui logo"
              height={40}
              radius="sm"
              src={data.profile_image}
              width={40}
            />
            <div className="flex flex-col">
              <p className="text-md">{data.user}</p>
              <p className="text-small text-default-500">nextui.org</p>
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
                aria-label="Продажби"
                startContent={""}
                subtitle={
                  <p className="flex">
                    2 issues to{" "}
                    <span className="text-primary ml-1">fix now</span>
                  </p>
                }
                title="Продажби"
              >
                {defaultContent}
              </AccordionItem>

              <AccordionItem
                key="2"
                aria-label="Наличности"
                tartContent={""}
                subtitle="3 apps have read permissions"
                title="Наличности"
              >
                {defaultContent}
              </AccordionItem>

              <AccordionItem
                key="3"
                aria-label="Оборот"
                classNames={{ subtitle: "text-warning" }}
                tartContent={""}
                subtitle="Complete your profile"
                title="Оборот"
              >
                {defaultContent}
              </AccordionItem>
              <AccordionItem
                key="4"
                aria-label="Печалба"
                classNames={{ subtitle: "text-danger" }}
                tartContent={""}
                subtitle="Please, update now"
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
