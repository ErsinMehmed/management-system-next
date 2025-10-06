import { makeAutoObservable } from "mobx";
import productAction from "@/actions/productAction";
import { validateFields } from "@/utils";
import { productRules as getProductRules } from "@/rules/product";
import commonStore from "@/stores/commonStore";

class Product {
  products = [];
  productData = {};
  isLoading = true;
  isProductUpdated = false;

  constructor() {
    makeAutoObservable(this);
  }

  setProducts = (data) => {
    this.products = data;
  };

  setProductData = (data) => {
    this.productData = data;
  };

  loadProducts = async () => {
    try {
      const products = await productAction.getProducts();
      this.setProducts(products);
    } finally {
      this.isLoading = false;
    }
  };

  loadProductsIfNotLoaded = async () => {
    if (this.products.length === 0) {
      await this.loadProducts();
    }
  };

  updateProduct = async (id, data) => {
    commonStore.resetMessages();
    this.isProductUpdated = true;

    try {
      data.price = parseFloat(data.price);
      data.availability = parseFloat(data.availability);

      const productRules = getProductRules();
      const errorFields = validateFields(this.productData, productRules);

      if (errorFields) {
        commonStore.setErrorFields(errorFields);
        this.isProductUpdated = false;

        return false;
      }

      const response = await productAction.updateProduct(id, data);

      if (response.status) {
        commonStore.setSuccessMessage(response.message);
        this.loadProducts();
        this.isProductUpdated = false;

        return true;
      }

      this.isProductUpdated = false;

      return false;
    } catch (error) {
      this.isProductUpdated = false;
      commonStore.setErrorMessage(
        error.message || "Възникна грешка при обновяването на продукта"
      );

      return false;
    }
  };
}

export default new Product();
