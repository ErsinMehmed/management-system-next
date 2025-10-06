"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { Tabs, Tab } from "@heroui/react";
import Layout from "@/components/layout/Dashboard";
import PieChart from "@/components/charts/PieChart";
import BarChart from "@/components/charts/BarChart";
import TabSection from "@/components/dashboard/TabSection";
import DashboardDateFilters from "@/components/dashboard/DashboardDateFilters";
import Table from "@/components/dashboard/Table";
import Box from "@/components/dashboard/Box";
import { categories } from "@/data";
import { formatCurrency } from "@/utils";
import LineChart from "@/components/charts/LineChart";
// import UploadTest from "@/components/UploadTest";

const Dashboard = () => {
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const { sellStats, loadSaleStats, loadLineChartSaleStats } = sellStore;
  const { expenses, loadExpenses } = expenseStore;
  const {
    incomes,
    additionalIncomes,
    loadAverageProfit,
    loadIncomes,
    loadAdditionalIncomes,
  } = incomeStore;
  const { products } = productStore;
  const { dashboardBoxPeriod, setDashboardBoxPeriod } = commonStore;
  const [selectedCategory, setSelectedCategory] = useState("Бутилки");

  useEffect(() => {
    const { dateFrom, dateTo } = dashboardBoxPeriod;

    const promises = [
      loadSaleStats(),
      loadLineChartSaleStats(),
      loadAverageProfit(),
    ];

    if (!dateFrom && !dateTo) {
      promises.push(loadAdditionalIncomes(), loadExpenses(), loadIncomes());
    }

    Promise.all(promises);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserRole = localStorage.getItem("userRole");
      setIsUserAdmin(
        storedUserRole === "Admin" || storedUserRole === "Super Admin"
      );
    }
  }, [setIsUserAdmin]);

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

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.category.name === "Бутилки" && product.availability > 0
      ),
    [products]
  );

  const filteredProductAvailabilities = filteredProducts?.map(
    ({ name, weight, image_url, availability, price, units_per_box }) => {
      const baseData = {
        name: `${name} ${weight}гр.`,
        image_url: image_url,
        carton: (availability / units_per_box).toFixed(1),
        availability,
      };

      if (isUserAdmin) {
        return {
          ...baseData,
          price: price * availability,
        };
      }

      return baseData;
    }
  );

  const allExpenses = (
    expenses.total_order_expenses +
    expenses.total_fuel_expenses +
    expenses.total_additional_expenses +
    expenses.total_ad_expenses
  ).toFixed(2);

  const profit = (incomes?.incomes + additionalIncomes?.incomes).toFixed(2);

  const columns = isUserAdmin
    ? ["продукт", "кашони", "бутилки", "стойност"]
    : ["продукт", "кашони", "бутилки"];

  return (
    <Layout title='Администраторско табло'>
      <DashboardDateFilters
        dashboardBoxPeriod={dashboardBoxPeriod}
        handleFieldChange={handleFieldChange}
      />

      <div
        className={`grid grid-cols-1 ${
          isUserAdmin ? "lg:grid-cols-3" : ""
        }  gap-5 mb-5`}>
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

                      <dd className='bg-gray-100 text-gray-700 inline-flex items-center px-2.5 py-1 rounded-md font-medium'>
                        {formatCurrency(additionalIncomes?.incomes, 2)}
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

        {isUserAdmin && (
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
                          <dt className='text-gray-500 font-semibold'>
                            Гориво
                          </dt>

                          <dd className='bg-gray-100 text-gray-700 inline-flex items-center px-2.5 py-1 rounded-md font-medium'>
                            {formatCurrency(expenses.total_fuel_expenses, 2)}
                          </dd>
                        </dl>
                      )}

                      {expenses.total_ad_expenses > 0 && (
                        <dl className='flex-container py-2.5 px-3 text-sm border-t'>
                          <dt className='text-gray-500 font-semibold'>
                            Реклами
                          </dt>

                          <dd className='bg-gray-100 text-gray-700 inline-flex items-center px-2.5 py-1 rounded-md font-medium'>
                            {formatCurrency(expenses.total_ad_expenses, 2)}
                          </dd>
                        </dl>
                      )}

                      {expenses.total_additional_expenses > 0 && (
                        <dl className='flex-container py-2.5 px-3 text-sm border-t'>
                          <dt className='text-gray-500 font-semibold'>
                            Допълнителни
                          </dt>

                          <dd className='bg-gray-100 text-gray-700 inline-flex items-center px-2.5 py-1 rounded-md font-medium'>
                            {formatCurrency(
                              expenses.total_additional_expenses,
                              2
                            )}
                          </dd>
                        </dl>
                      )}

                      {((expenses.total_fuel_expenses > 0 &&
                        expenses.total_additional_expenses > 0) ||
                        (expenses.total_fuel_expenses > 0 &&
                          expenses.total_ad_expenses > 0)) && (
                        <dl className='flex items-center justify-end py-2.5 px-3 text-sm border-t'>
                          <dd className='bg-gray-100 text-gray-700 inline-flex items-center px-2.5 py-1 rounded-md font-semibold'>
                            {formatCurrency(
                              expenses.total_fuel_expenses +
                                expenses.total_additional_expenses +
                                expenses.total_ad_expenses,
                              2
                            )}
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
        )}

        {isUserAdmin && (
          <Box
            title='Печалба'
            period={dashboardBoxPeriod}
            value={(profit - allExpenses).toFixed(2)}
            icon={<TbMoneybag className='w-6 h-6' />}
            modal={false}
          />
        )}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-y-5 lg:gap-5 mb-5'>
        <PieChart
          data={sellStats.sales}
          status={sellStats.status}
          message={sellStats.message}
        />

        <div className='col-span-2 h-full'>
          <Table
            title='Наличност на бутилки'
            data={filteredProductAvailabilities}
            columns={columns}
          />
        </div>
      </div>

      {isUserAdmin && (
        <div className='2xl:grid grid-cols-1 2xl:grid-cols-2 gap-5'>
          <LineChart />

          <BarChart />
        </div>
      )}

      {/* <UploadTest /> */}
    </Layout>
  );
};

export default observer(Dashboard);
