import { getPeriodParam, fetchData } from "@/utils";

class Income {
  createIncome = async (data) => {
    try {
      const response = await fetch("/api/additional-incomes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      return response.json();
    } catch (error) {
      throw error;
    }
  };

  getIncomes = async (period) => {
    try {
      const periodParam = getPeriodParam(period);
      const userId = localStorage.getItem("userId");
      const response = await fetch(
        `/api/incomes?${periodParam}&userId=${userId}`
      );

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  getAdditionalIncomes = async (period) => {
    try {
      const periodParam = getPeriodParam(period);
      const response = await fetch(`/api/additional-incomes?${periodParam}`);

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  getAverageProfit = async (period) => {
    if (!period?.dateFrom && !period?.dateTo) {
      const currentDate = new Date();
      const startOfYear = new Date(currentDate.getFullYear(), 0, 1);

      period = {
        dateFrom: startOfYear.toISOString().split("T")[0],
        dateTo: currentDate.toISOString().split("T")[0],
      };
    }

    try {
      const response = await fetch(
        `/api/get-average-profit?dateFrom=${period.dateFrom}&dateTo=${period.dateTo}`
      );

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  getSaleIncomes = async (period) => {
    try {
      const periodParam = getPeriodParam(period);
      const response = await fetch(
        `/api/sales/get-total-incomes?${periodParam}`
      );

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  getAllIncomes = async (
    page,
    perPage,
    searchText,
    filterData,
    orderColumn
  ) => {
    return await fetchData(
      "get-additional-incomes",
      page,
      perPage,
      "",
      "",
      orderColumn
    );
  };

  IncomeSell = async (id) => {
    try {
      const response = await fetch(`/api/additional-incomes?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  };
}

export default new Income();
