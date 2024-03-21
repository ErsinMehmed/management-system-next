import { getPeriodParam } from "@/utils";

class Income {
  getIncomes = async (period) => {
    try {
      const periodParam = getPeriodParam(period);
      const response = await fetch(`/api/incomes?${periodParam}`);

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  getAdditonalIncomes = async () => {
    try {
      const response = await fetch("/api/additional-incomes");

      return await response.json();
    } catch (error) {
      throw error;
    }
  };
}

export default new Income();
