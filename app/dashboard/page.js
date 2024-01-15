"use client";
import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  sellStore,
  expenseStore,
  incomeStore,
  commonStore,
} from "@/stores/useStore";
import { MdAttachMoney } from "react-icons/md";
import { TbMoneybag } from "react-icons/tb";
import { Tabs, Tab } from "@nextui-org/react";
import Layout from "@/components/layout/Dashboard";
import PieChart from "@/components/charts/PieChart";
import Select from "@/components/html/Select";
import Input from "@/components/html/Input";
import Box from "@/components/dashboard/Box";
import { categories, periods } from "@/data";

const Dashboard = () => {
  const { sellStats, loadSaleStats } = sellStore;
  const { expenses, loadExpenses } = expenseStore;
  const { incomes, loadIncomes } = incomeStore;
  const { dashboardBoxPeriod, setDashboardBoxPeriod } = commonStore;
  const [selectedCategory, setSelectedCategory] = useState("Бутилки");
  const [showBoxFilter, setShowBoxFilter] = useState(false);

  useEffect(() => {
    loadSaleStats();
  }, [loadSaleStats]);

  useEffect(() => {
    loadExpenses();
    loadIncomes();
  }, [loadExpenses, loadIncomes]);

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

              <dt className="text-gray-500 font-semibold">
                {exprence.quantity} бр.
              </dt>

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

  const filteredIncomes = incomes.incomes_by_products?.filter(
    (income) => income.category === selectedCategory
  );

  const totalIncomesByCategory = filteredIncomes?.reduce(
    (accumulator, stat) => accumulator + stat.total_incomes,
    0
  );

  const incomeSection = (
    <div className="bg-gray-50 rounded-lg">
      {filteredIncomes?.length > 0 ? (
        <>
          {filteredIncomes?.map((income, index) => (
            <dl
              key={index}
              className={`flex items-center justify-between ${
                index > 0 && "border-t"
              } py-2.5 px-3 text-sm`}
            >
              <dt className="text-gray-500 font-semibold">{income.name}</dt>

              <dt className="text-gray-500 font-semibold">
                {income.quantity} бр.
              </dt>

              <dd className="bg-gray-100 text-gray-800 inline-flex items-center px-2.5 py-1 rounded-md font-medium">
                {income.total_incomes.toFixed(2)} лв.
              </dd>
            </dl>
          ))}

          {filteredIncomes?.length > 1 && (
            <dl className="flex items-center justify-between py-2.5 px-3 text-sm border-t">
              <dt />

              <dd className="bg-gray-100 text-gray-800 inline-flex items-center px-2.5 py-1 rounded-md font-semibold">
                {totalIncomesByCategory.toFixed(2)} лв.
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

  const handleInputChange = (name, value) => {
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
  };

  const handleBoxFilter = () => {
    setShowBoxFilter(!showBoxFilter);
  };

  return (
    <Layout title="Администраторско табло">
      <div className="md:flex items-center justify-between">
        <button
          onClick={handleBoxFilter}
          className="text-white bg-[#0071f5] hover:bg-blue-600 focus:outline-none font-semibold rounded-full text-sm px-1.5 md:px-4 2xl:px-6 py-2.5 mb-4 md:mb-0 md:py-1.5 2xl:py-2.5 md:-mt-3 text-center transition-all active:scale-95 w-full md:w-auto"
        >
          Покажи филтрите
        </button>

        {showBoxFilter && (
          <div className="flex flex-col md:flex-row items-center bg-white p-3 gap-3.5 w-full md:w-4/6 2xl:w-3/5 rounded-md shadow-md mb-5">
            <Input
              type="date"
              label="От"
              value={dashboardBoxPeriod.dateFrom || ""}
              onChange={(value) => handleInputChange("dateFrom", value)}
            />

            <Input
              type="date"
              label="До"
              value={dashboardBoxPeriod.dateTo || ""}
              onChange={(value) => handleInputChange("dateTo", value)}
            />

            <Select
              items={periods}
              label="Избери период"
              value={dashboardBoxPeriod.period || ""}
              onChange={(value) => handleInputChange("period", value)}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <Box
          title="Приходи"
          period={dashboardBoxPeriod}
          modalContent={
            <Tabs
              aria-label="Options"
              selectedKey={selectedCategory}
              onSelectionChange={setSelectedCategory}
            >
              {categories.map((category) => (
                <Tab key={category} title={category}>
                  {incomeSection}
                </Tab>
              ))}
            </Tabs>
          }
          value={incomes.incomes?.toFixed(2)}
          icon={<MdAttachMoney className="w-6 h-6" />}
          modalTitle="Приходи по категории"
          modal={true}
        />

        <Box
          title="Разходи"
          period={dashboardBoxPeriod}
          modalContent={
            <Tabs
              aria-label="Options"
              selectedKey={selectedCategory}
              onSelectionChange={setSelectedCategory}
            >
              {categories.map((category) => (
                <Tab key={category} title={category}>
                  {expenseSection}
                </Tab>
              ))}

              <Tab key="Други" title="Други">
                <div className="bg-gray-50 rounded-lg">
                  <dl className="flex items-center justify-between py-2.5 px-3 text-sm">
                    <dt className="text-gray-500 font-semibold">Гориво</dt>

                    <dd className="bg-gray-100 text-gray-800 inline-flex items-center px-2.5 py-1 rounded-md font-medium">
                      {expenses.total_fuel_expenses?.toFixed(2)} лв.
                    </dd>
                  </dl>

                  <dl className="flex items-center justify-between py-2.5 px-3 text-sm border-t">
                    <dt className="text-gray-500 font-semibold">
                      Допълнителни (външни поръчки)
                    </dt>

                    <dd className="bg-gray-100 text-gray-800 inline-flex items-center px-2.5 py-1 rounded-md font-medium">
                      {expenses.total_additional_expenses?.toFixed(2)} лв.
                    </dd>
                  </dl>
                </div>
              </Tab>
            </Tabs>
          }
          value={(
            expenses.total_order_expenses +
            expenses.total_fuel_expenses +
            expenses.total_additional_expenses
          ).toFixed(2)}
          icon={<MdAttachMoney className="w-6 h-6" />}
          modalTitle="Разходи по категории"
          modal={true}
        />

        <Box
          title="Печалба"
          period={dashboardBoxPeriod}
          value={(
            incomes.incomes?.toFixed(2) -
            (
              expenses.total_order_expenses +
              expenses.total_fuel_expenses +
              expenses.total_additional_expenses
            ).toFixed(2)
          ).toFixed(2)}
          icon={<TbMoneybag className="w-6 h-6" />}
          modal={false}
        />
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
