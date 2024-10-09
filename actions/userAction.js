import { getPeriodParam } from "@/utils";

class User {
  getUserSales = async (period) => {
    try {
      const periodParam = getPeriodParam(period);

      const response = await fetch(`/api/get-user-sales?${periodParam}`);

      return await response.json();
    } catch (error) {
      throw error;
    }
  };
}

export default new User();
