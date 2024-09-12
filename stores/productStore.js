import { makeObservable, observable, action } from "mobx";
import productAction from "@/actions/productAction";
import { validateFields } from "@/utils";
import { productRules as getProductRules } from "@/rules/product";
import commonStore from "./commonStore";

class Product {
  products = [];
  productData = {};
  isProductUpdated = false;

  constructor() {
    makeObservable(this, {
      products: observable,
      productData: observable,
      isProductUpdated: observable,
      setProducts: action,
      setProductData: action,
    });
  }

  setProducts = (data) => {
    this.products = data;
  };

  setProductData = (data) => {
    this.productData = data;
  };

  loadProducts = async () => {
    this.setProducts(await productAction.getProducts());
  };

  updateProduct = async (id, data) => {
    commonStore.setErrorFields({});
    commonStore.setErrorMessage(null);
    commonStore.setSuccessMessage(null);
    this.isProductUpdated = true;

    data.price = parseFloat(data.price);

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
  };
}

export default new Product();
