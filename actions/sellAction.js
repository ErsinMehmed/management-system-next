class Sell {
  createSell = async (data) => {
    try {
      const response = await fetch("/api/sells", {
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

  getSells = async (page, perPage, searchText, filterData) => {
    try {
      let url = `/api/sells?page=${page ?? 1}&per_page=${perPage ?? 10}`;

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
      const response = await fetch(`/api/sells?id=${id}`, {
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

export default new Sell();
