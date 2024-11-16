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

  getUserStocks = async (userId) => {
    try {
      const user = userId ?? localStorage.getItem("userId");
      const response = await fetch(`/api/user-stocks?userId=${user}`);

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

  getDisributors = async () => {
    try {
      const response = await fetch("/api/distributors");

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  updateUserStocks = async (data) => {
    try {
      const response = await fetch(`/api/user-stocks`, {
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

  addUserStock = async (data) => {
    try {
      const response = await fetch(`/api/user-stocks`, {
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
