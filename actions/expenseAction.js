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
}

export default new Expense();
