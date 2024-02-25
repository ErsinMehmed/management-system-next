import { fetchData } from "@/utils";

class Sell {
  constructor() {
    this.cache = new Map();
  }

  createSell = async (data) => {
    try {
      const response = await fetch("/api/sales", {
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

  getSales = async (page, perPage, searchText, filterData, orderColumn) => {
    return await fetchData(
      "sales",
      page,
      perPage,
      searchText,
      filterData,
      orderColumn
    );
  };

  deleteSell = async (id) => {
    try {
      const response = await fetch(`/api/sales?id=${id}`, {
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

  getStats = async (period) => {
    try {
      switch (period) {
        case "Днес":
          period = "today";
          break;
        case "Вчера":
          period = "yesterday";
          break;
        case "Последните 7 дни":
          period = "last7days";
          break;
        case "Последният месец":
          period = "lastMonth";
          break;
        case "Последните 3 месеца":
          period = "last3Months";
          break;
        case "Последните 6 месеца":
          period = "last6Months";
          break;
        case "Последната година":
          period = "lastYear";
          break;
        default:
          period = "lastYear";
          break;
      }

      if (
        this.cache.has("period") &&
        this.cache.has("stats") &&
        this.cache.get("period") === period
      ) {
        return this.cache.get("stats");
      }

      const response = await fetch(`/api/sales-stats?period=${period}`);
      const stats = response.json();

      this.cache.set("period", period);
      this.cache.set("stats", stats);

      return await stats;
    } catch (error) {
      throw error;
    }
  };

  getValues = async () => {
    try {
      const response = await fetch("/api/values");

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  updateValue = async (id, data) => {
    try {
      const response = await fetch(`/api/values/${id}`, {
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

export default new Sell();
