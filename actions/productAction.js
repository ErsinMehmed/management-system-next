class Product {
  createProduct = async (data) => {
    try {
      const response = await fetch("/api/products", {
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

  updateProduct = async (id, data) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
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

  getProduct = async (id) => {
    const response = await fetch(`/api/products/${id}`);

    return response.json();
  };

  getProducts = async () => {
    try {
      let url = `/api/products`;

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

  getProductAvailabilities = async () => {
    try {
      const response = await fetch("/api/availabilities");

      const data = await response.json();

      return data;
    } catch (error) {
      throw error;
    }
  };
}

export default new Product();
