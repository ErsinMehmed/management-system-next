import { getPeriodParam } from "@/utils";

class User {
  getUserSales = async (period) => {
    try {
      const periodParam = getPeriodParam(period);

      const response = await fetch(`/api/sales/users?${periodParam}`);

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  getUsers = async () => {
    try {
      const response = await fetch("/api/users/list");

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  getDistributors = async () => {
    try {
      const response = await fetch("/api/distributors");

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  updateUser = async (id, data) => {
    try {
      const response = await fetch(`/api/users/edit/${id}`, {
        method: "PUT",
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
}

export default new User();
