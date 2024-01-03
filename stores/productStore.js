import { makeObservable, observable, action } from "mobx";
import productAction from "@/actions/productAction";

class Product {
  products = [];

  constructor() {
    makeObservable(this, {
      products: observable,
      setProducts: action,
    });
  }

  setProducts = (data) => {
    this.products = data;
  };

  loadProducts = async () => {
    this.setProducts(await productAction.getProducts());
  };
}

export default new Product();
