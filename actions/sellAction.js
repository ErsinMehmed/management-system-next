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
        case "Всички резултати":
          period = "all";
          break;
        default:
          period = "all";
          break;
      }

      const statsCacheKey = `stats:${period}`;

      if (this.cache.has(statsCacheKey)) {
        return this.cache.get(statsCacheKey);
      }

      const response = await fetch(`/api/sales/statistics?period=${period}`);
      const stats = await response.json();

      this.cache.set(statsCacheKey, stats);

      return stats;
    } catch (error) {
      throw error;
    }
  };

  getLineChartStats = async (period) => {
    try {
      switch (period) {
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
          period = "last7days";
          break;
      }

      const lineCacheKey = `line:${period}`;
      if (this.cache.has(lineCacheKey)) {
        return this.cache.get(lineCacheKey);
      }

      const response = await fetch(
        `/api/sales/statistics-line-chart?period=${period}`
      );
      const stats = await response.json();

      this.cache.set(lineCacheKey, stats);

      return stats;
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

  updateValue = async (data) => {
    try {
      const response = await fetch("/api/values", {
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
