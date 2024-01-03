class Order {
  createOrder = async (data) => {
    try {
      const response = await fetch("/api/orders", {
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

  getOrders = async () => {
    try {
      let url = `/api/orders`;

      //   if (searchText) {
      //     url += `&search=${searchText}`;
      //   }

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
}

export default new Order();
