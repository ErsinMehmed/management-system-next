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
      const response = await fetch("/api/products");

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  getProductAvailabilities = async () => {
    try {
      const response = await fetch("/api/availabilities");

      return await response.json();
    } catch (error) {
      throw error;
    }
  };
}

export default new Product();
