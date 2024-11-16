"use client";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import Layout from "@/components/layout/Dashboard";
import UserAviability from "@/components/pages/users/UserAviability";
import UserInformation from "@/components/pages/users/UserInformation";
import DateRangePicker from "@/components/html/DateRangePicker";
import SkeletonLoader from "@/components/pages/users/SkeletonCardLoader";
import UserCard from "@/components/pages/users/Card";
import { userStore, expenseStore, incomeStore } from "@/stores/useStore";
import { parseDate } from "@internationalized/date";
import moment from "moment";

const UserSales = () => {
  const { isUserSalesLoad, loadUserSales, loadUsers } = userStore;
  const { loadTotalSaleIncomes } = incomeStore;
  const { loadProductExpenses, loadFuelExpenses, loadAdditionalExpenses } =
    expenseStore;
  const [dateRange, setDateRange] = useState({
    start: parseDate(moment().subtract(7, "days").format("YYYY-MM-DD")),
    end: parseDate(moment().format("YYYY-MM-DD")),
  });
  const [isUserAdmin, setIsUserAdmin] = useState(false);

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserRole = localStorage.getItem("userRole");
      setIsUserAdmin(
        storedUserRole === "Admin" || storedUserRole === "Super Admin"
      );
    }
  }, [setIsUserAdmin]);

  const handleDateChange = (newValue) => {
    const period = transformDateRange(newValue);
    setDateRange(newValue);
    loadUserSales(period);
    loadProductExpenses(period);
    loadTotalSaleIncomes(period);
    loadFuelExpenses(period);
    loadAdditionalExpenses(period);
  };

  return (
    <Layout title='Продажби по потребители'>
      {/* <div className="grid xl:grid-cols-2">
        <div className="col-span-1 flex flex-col lg:flex-row items-center bg-white p-3 gap-3.5 w-full rounded-md shadow-md mb-5">
          <DateRangePicker
            label="Избери дата"
            value={dateRange}
            onChange={handleDateChange}
          />

          {isUserAdmin && (
            <div className="flex items-center gap-x-3.5">
              <UserInformation period={transformDateRange(dateRange)} />
              <UserAviability period={transformDateRange(dateRange)} />
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
        {isUserSalesLoad ? <SkeletonLoader /> : <UserCard />}
      </div> */}
    </Layout>
  );
};

export default observer(UserSales);
