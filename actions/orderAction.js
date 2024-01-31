import { fetchData } from "@/utils";

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

  getOrders = async (page, perPage, searchText, filterData, orderColumn) => {
    return await fetchData(
      "orders",
      page,
      perPage,
      searchText,
      filterData,
      orderColumn
    );
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
