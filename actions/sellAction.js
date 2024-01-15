class Sell {
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

  getSales = async (page, perPage, searchText, filterData) => {
    try {
      let url = `/api/sales?page=${page ?? 1}&per_page=${perPage ?? 10}`;

      if (searchText) {
        url += `&search=${searchText}`;
      }

      //   if (filterData?.dateFrom) {
      //     url += `&date_from=${filterData.dateFrom}`;
      //   }

      //   if (filterData?.dateTo) {
      //     url += `&date_to=${filterData.dateTo}`;
      //   }

      //   if (filterData?.status) {
      //     url += `&status=${filterData.status}`;
      //   }

      //   if (filterData?.field) {
      //     url += `&field=${filterData.field}`;
      //   }

      //   if (filterData?.employmentType) {
      //     url += `&employment_type=${filterData.employmentType}`;
      //   }

      //   if (filterData?.minSalary) {
      //     url += `&min_salary=${filterData.minSalary}`;
      //   }

      //   if (filterData?.maxSalary) {
      //     url += `&max_salary=${filterData.maxSalary}`;
      //   }

      const response = await fetch(url);

      const data = await response.json();

      return data;
    } catch (error) {
      throw error;
    }
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
          period = "lastMonth";
          break;
      }

      const response = await fetch(`/api/sales-stats?period=${period}`);

      return await response.json();
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
}

export default new Sell();
