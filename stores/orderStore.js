import { makeObservable, observable, action } from "mobx";
import orderAction from "@/actions/orderAction";
import { validateFields } from "@/utils";
import { orderRules as getOrderRules } from "@/rules/order";
import commonStore from "./commonStore";

class Order {
  orders = [];
  orderData = {
    quantity: null,
    total_amount: null,
    price: null,
    product: "",
  };

  constructor() {
    makeObservable(this, {
      orders: observable,
      orderData: observable,
      setOrders: action,
      setOrderData: observable,
    });
  }

  setOrders = (data) => {
    this.orders = data;
  };

  setOrderData = (data) => {
    this.orderData = data;
  };

  clearOrderData = () => {
    this.orderData = {
      quantity: null,
      total_amount: null,
      price: null,
      product: "",
    };
  };

  loadOrders = async () => {
    this.setOrders(await orderAction.getOrders());
  };

  createOrder = async () => {
    commonStore.setErrorFields({});
    commonStore.setErrorMessage("");
    commonStore.setSuccessMessage("");

    const orderRules = getOrderRules();
    const errorFields = validateFields(this.orderData, orderRules);

    if (errorFields) {
      commonStore.setErrorFields(errorFields);
      return;
    }
  };
}

export default new Order();
