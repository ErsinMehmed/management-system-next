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

  getOrders = async (page, perPage, searchText, filterData) => {
    try {
      let url = `/api/orders?page=${page ?? 1}&per_page=${perPage ?? 10}`;

      if (searchText) {
        url += `&search=${searchText}`;
      }

      if (filterData?.dateFrom) {
        url += `&date_from=${filterData.dateFrom}`;
      }

      if (filterData?.dateTo) {
        url += `&date_to=${filterData.dateTo}`;
      }

      if (filterData?.product) {
        url += `&product=${filterData.product}`;
      }

      if (filterData?.minQuantity) {
        url += `&min_quantity=${filterData.minQuantity}`;
      }

      if (filterData?.maxQuantity) {
        url += `&max_quantity=${filterData.maxQuantity}`;
      }

      const response = await fetch(url);

      const data = await response.json();

      return data;
    } catch (error) {
      throw error;
    }
  };

  deleteOrder = async (id) => {
    try {
      const response = await fetch(`/api/orders?id=${id}`, {
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

export default new Order();
