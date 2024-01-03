import { makeObservable, observable, action } from "mobx";
import orderAction from "@/actions/orderAction";

class Order {
  orders = [];

  constructor() {
    makeObservable(this, {
      orders: observable,
      setOrders: action,
    });
  }

  setOrders = (data) => {
    this.orders = data;
  };

  loadOrders = async () => {
    this.setOrders(await orderAction.getOrders());
  };
}

export default new Order();
