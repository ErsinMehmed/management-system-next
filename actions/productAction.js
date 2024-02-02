class Product {
  constructor() {
    this.cache = new Map();
  }

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

      this.cache.delete(id);

      return response.json();
    } catch (error) {
      throw error;
    }
  };

  getProduct = async (id) => {
    try {
      if (this.cache.has(id)) {
        return this.cache.get(id);
      }

      const response = await fetch(`/api/products/${id}`);
      const product = await response.json();

      this.cache.set(id, product);

      return product;
    } catch (error) {
      throw error;
    }
  };

  getProducts = async (noCache = false) => {
    try {
      if (!noCache && this.cache.has("products")) {
        return this.cache.get("products");
      }

      const response = await fetch("/api/products");
      const products = await response.json();

      this.cache.set("products", products);

      return products;
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
