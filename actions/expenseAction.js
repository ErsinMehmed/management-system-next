import { getPeriodParam } from "@/utils";

class Expense {
  getExpenses = async (period) => {
    try {
      const periodParam = getPeriodParam(period);
      const response = await fetch(`/api/expenses?${periodParam}`);

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  getProductExpenses = async (period) => {
    try {
      const periodParam = getPeriodParam(period);
      const response = await fetch(
        `/api/expenses/get-total-product?${periodParam}`
      );

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  getFuelExpenses = async (period) => {
    try {
      const periodParam = getPeriodParam(period);
      const response = await fetch(
        `/api/expenses/get-total-fuel-price?${periodParam}`
      );

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  getAdditionalExpenses = async (period) => {
    try {
      const periodParam = getPeriodParam(period);
      const response = await fetch(
        `/api/expenses/get-total-additional?${periodParam}`
      );

      return await response.json();
    } catch (error) {
      throw error;
    }
  };
}

export default new Expense();
