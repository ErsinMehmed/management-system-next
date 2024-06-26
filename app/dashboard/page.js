"use client";
import React, { useState, useEffect, useCallback } from "react";
import { observer } from "mobx-react-lite";
import {
  sellStore,
  expenseStore,
  incomeStore,
  commonStore,
  productStore,
} from "@/stores/useStore";
import { MdAttachMoney } from "react-icons/md";
import { TbMoneybag } from "react-icons/tb";
import { Tabs, Tab } from "@nextui-org/react";
import Layout from "@/components/layout/Dashboard";
import PieChart from "@/components/charts/PieChart";
import Select from "@/components/html/Select";
import Input from "@/components/html/Input";
import TabSection from "@/components/dashboard/TabSection";
import Table from "@/components/dashboard/Table";
import Box from "@/components/dashboard/Box";
import { categories, periods } from "@/data";
import { formatCurrency } from "@/utils";

const Dashboard = () => {
  const { sellStats, loadSaleStats } = sellStore;
  const { expenses, loadExpenses } = expenseStore;
  const { incomes, additionalIncomes, loadIncomes, loadAdditionalIncomes } =
    incomeStore;
  const { products } = productStore;
  const { dashboardBoxPeriod, setDashboardBoxPeriod } = commonStore;
  const [selectedCategory, setSelectedCategory] = useState("Бутилки");

  useEffect(() => {
    loadAdditionalIncomes();
    loadSaleStats();
    loadExpenses();
    loadIncomes();
  }, [loadAdditionalIncomes, loadSaleStats, loadExpenses, loadIncomes]);

  const handleFieldChange = useCallback(
    (name, value) => {
      if (name === "period") {
        setDashboardBoxPeriod({
          ...dashboardBoxPeriod,
          [name]: value,
          dateFrom: "",
          dateTo: "",
        });
      } else {
        setDashboardBoxPeriod({ ...dashboardBoxPeriod, [name]: value });
      }
    },
    [dashboardBoxPeriod, setDashboardBoxPeriod]
  );

  const filteredProducts = products.filter(
    (product) => product.category.name === "Бутилки" && product.availability > 0
  );

  function calculateCarton(name, weight, availability) {
    switch (name) {
      case "Baking Bad":
        if (weight === 2200) return availability / 4;
      case "Great Whip":
        if (weight === 2200) {
          return availability / 4;
        } else if (weight === 3300) {
          return availability / 2;
        } else {
          return availability / 6;
        }
      default:
        return availability / 6;
    }
  }

  const filteredProductAvailabilities = filteredProducts?.map(
    ({ name, weight, image_url, availability, price }) => ({
      name: `${name} ${weight}гр.`,
      image_url: image_url,
      carton: calculateCarton(name, weight, availability).toFixed(1),
      availability,
      price: price * availability,
    })
  );

  const allExpenses = (
    expenses.total_order_expenses +
    expenses.total_fuel_expenses +
    expenses.total_additional_expenses +
    expenses.total_ad_expenses
  ).toFixed(2);

  const profit = (incomes?.incomes + additionalIncomes?.incomes).toFixed(2);

  return (
    <Layout title='Администраторско табло'>
      <div className='grid grid-cols-3'>
        <div className='col-span-3 lg:col-span-2 lg:col-start-2 lg:ml-2 flex flex-col lg:flex-row items-center bg-white p-3 gap-3.5 w-full rounded-md shadow-md mb-5'>
          <Input
            type='date'
            label='От'
            value={dashboardBoxPeriod.dateFrom || ""}
            onChange={(value) => handleFieldChange("dateFrom", value)}
          />

          <Input
            type='date'
            label='До'
            value={dashboardBoxPeriod.dateTo || ""}
            onChange={(value) => handleFieldChange("dateTo", value)}
          />

          <Select
            items={periods}
            label='Избери период'
            value={dashboardBoxPeriod.period || ""}
            onChange={(value) => handleFieldChange("period", value)}
          />
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5'>
        <Box
          title='Приходи'
          period={dashboardBoxPeriod}
          modalContent={
            <Tabs
              aria-label='Options'
              selectedKey={selectedCategory}
              onSelectionChange={setSelectedCategory}>
              {categories.map((category) => (
                <Tab
                  key={category}
                  title={category}>
                  <TabSection
                    data={incomes}
                    kind='incomes'
                    category={category}
                    totalKey='total_incomes'
                  />
                </Tab>
              ))}

              {additionalIncomes?.incomes > 0 && (
                <Tab title='Други'>
                  <div className='bg-gray-50 rounded-lg'>
                    <dl className='flex-container py-2.5 px-3 text-sm'>
                      <dt className='text-gray-500 font-semibold'>
                        Допълнителни приходи
                      </dt>

                      <dd className='bg-gray-100 text-gray-800 inline-flex items-center px-2.5 py-1 rounded-md font-medium'>
                        {formatCurrency(additionalIncomes?.incomes, 2)} лв.
                      </dd>
                    </dl>
                  </div>
                </Tab>
              )}
            </Tabs>
          }
          value={profit}
          icon={<MdAttachMoney className='w-6 h-6' />}
          modalTitle='Приходи по категории'
          modal={true}
        />

        <Box
          title='Разходи'
          period={dashboardBoxPeriod}
          modalContent={
            <Tabs
              aria-label='Options'
              selectedKey={selectedCategory}
              onSelectionChange={setSelectedCategory}>
              {categories.map((category) => (
                <Tab
                  key={category}
                  title={category}>
                  <TabSection
                    data={expenses}
                    kind='expenses'
                    category={category}
                    totalKey='total_expenses'
                  />
                </Tab>
              ))}

              {(expenses.total_fuel_expenses > 0 ||
                expenses.total_additional_expenses > 0 ||
                expenses.total_ad_expenses > 0) && (
                <Tab
                  key='Други'
                  title='Други'>
                  <div className='bg-gray-50 rounded-lg'>
                    {expenses.total_fuel_expenses > 0 && (
                      <dl className='flex-container py-2.5 px-3 text-sm'>
                        <dt className='text-gray-500 font-semibold'>Гориво</dt>

                        <dd className='bg-gray-100 text-gray-800 inline-flex items-center px-2.5 py-1 rounded-md font-medium'>
                          {formatCurrency(expenses.total_fuel_expenses, 2)} лв.
                        </dd>
                      </dl>
                    )}

                    {expenses.total_ad_expenses > 0 && (
                      <dl className='flex-container py-2.5 px-3 text-sm border-t'>
                        <dt className='text-gray-500 font-semibold'>Реклами</dt>

                        <dd className='bg-gray-100 text-gray-800 inline-flex items-center px-2.5 py-1 rounded-md font-medium'>
                          {formatCurrency(expenses.total_ad_expenses, 2)} лв.
                        </dd>
                      </dl>
                    )}

                    {expenses.total_additional_expenses > 0 && (
                      <dl className='flex-container py-2.5 px-3 text-sm border-t'>
                        <dt className='text-gray-500 font-semibold'>
                          Допълнителни
                        </dt>

                        <dd className='bg-gray-100 text-gray-800 inline-flex items-center px-2.5 py-1 rounded-md font-medium'>
                          {formatCurrency(
                            expenses.total_additional_expenses,
                            2
                          )}{" "}
                          лв.
                        </dd>
                      </dl>
                    )}

                    {((expenses.total_fuel_expenses > 0 &&
                      expenses.total_additional_expenses > 0) ||
                      (expenses.total_fuel_expenses > 0 &&
                        expenses.total_ad_expenses > 0)) && (
                      <dl className='flex items-center justify-end py-2.5 px-3 text-sm border-t'>
                        <dd className='bg-gray-100 text-gray-800 inline-flex items-center px-2.5 py-1 rounded-md font-semibold'>
                          {formatCurrency(
                            expenses.total_fuel_expenses +
                              expenses.total_additional_expenses +
                              expenses.total_ad_expenses,
                            2
                          )}
                          лв.
                        </dd>
                      </dl>
                    )}
                  </div>
                </Tab>
              )}
            </Tabs>
          }
          value={allExpenses}
          icon={<MdAttachMoney className='w-6 h-6' />}
          modalTitle='Разходи по категории'
          modal={true}
        />

        <Box
          title='Печалба'
          period={dashboardBoxPeriod}
          value={(profit - allExpenses).toFixed(2)}
          icon={<TbMoneybag className='w-6 h-6' />}
          modal={false}
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-y-5 lg:gap-5'>
        <PieChart
          data={sellStats.sales}
          status={sellStats.status}
          message={sellStats.message}
        />

        <div className='col-span-2 h-full'>
          <Table
            title='Наличност на бутилки'
            data={filteredProductAvailabilities}
            columns={["продукт", "кашони", "бутилки", "стойност"]}
          />
        </div>
      </div>
    </Layout>
  );
};

export default observer(Dashboard);
