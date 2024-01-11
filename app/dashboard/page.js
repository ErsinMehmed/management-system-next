"use client";
import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { sellStore, expenseStore } from "@/stores/useStore";
import { MdAttachMoney } from "react-icons/md";
import { TbMoneybag } from "react-icons/tb";
import { Tabs, Tab } from "@nextui-org/react";
import Layout from "@/components/layout/Dashboard";
import PieChart from "@/components/charts/PieChart";
import Box from "@/components/dashboard/Box";

const Dashboard = () => {
  const { sellStats, loadSaleStats } = sellStore;
  const { expensePeriod, expenses, setExpensePeriod, loadExpenses } =
    expenseStore;
  const [selectedCategory, setSelectedCategory] = useState("Бутилки");

  useEffect(() => {
    loadSaleStats();
  }, [loadSaleStats]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const filteredExpenses = expenses.expenses_by_products?.filter(
    (expense) => expense.category === selectedCategory
  );

  const totalExpensesByCategory = filteredExpenses?.reduce(
    (accumulator, stat) => accumulator + stat.total_expenses,
    0
  );

  const expenseSection = (
    <div className="bg-gray-50 rounded-lg">
      {filteredExpenses?.length > 0 ? (
        <>
          {filteredExpenses?.map((exprence, index) => (
            <dl
              key={index}
              className={`flex items-center justify-between ${
                index > 0 && "border-t"
              } py-2.5 px-3 text-sm`}
            >
              <dt className="text-gray-500 font-semibold">{exprence.name}</dt>

              <dd className="bg-gray-100 text-gray-800 inline-flex items-center px-2.5 py-1 rounded-md font-medium">
                {exprence.total_expenses.toFixed(2)} лв.
              </dd>
            </dl>
          ))}

          {filteredExpenses?.length > 1 && (
            <dl className="flex items-center justify-between py-2.5 px-3 text-sm border-t">
              <dt />

              <dd className="bg-gray-100 text-gray-800 inline-flex items-center px-2.5 py-1 rounded-md font-semibold">
                {totalExpensesByCategory.toFixed(2)} лв.
              </dd>
            </dl>
          )}
        </>
      ) : (
        <div className="text-gray-500 text-center py-3 font-semibold text-sm">
          Няма налични данни
        </div>
      )}
    </div>
  );

  return (
    <Layout title="Администраторско табло">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        <Box
          title="Разходи"
          period={expensePeriod}
          setPeriod={setExpensePeriod}
          modalContent={
            <Tabs
              aria-label="Options"
              selectedKey={selectedCategory}
              onSelectionChange={setSelectedCategory}
            >
              <Tab key="Бутилки" title="Бутилки">
                {expenseSection}
              </Tab>
              <Tab key="Балони" title="Балони">
                {expenseSection}
              </Tab>
              <Tab key="Накрайници" title="Накрайници">
                {expenseSection}
              </Tab>
            </Tabs>
          }
          value={(
            expenses.total_order_expenses + expenses.total_fuel_expenses
          ).toFixed(2)}
          icon={<MdAttachMoney className="w-6 h-6" />}
          modalTitle="Разходи по категории"
          modal={true}
        />
        {/* <Box title="Приходи" icon={<MdAttachMoney className="w-6 h-6" />} />
        <Box title="Печалба" icon={<TbMoneybag className="w-6 h-6" />} /> */}
      </div>

      <PieChart
        data={sellStats.sales}
        status={sellStats.status}
        message={sellStats.message}
      />
    </Layout>
  );
};

export default observer(Dashboard);
