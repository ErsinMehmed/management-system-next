import { makeObservable, observable, action } from "mobx";
import userAction from "@/actions/userAction";

class User {
  userSales = [];
  userStocks = [];

  constructor() {
    makeObservable(this, {
      userSales: observable,
      userStocks: observable,
    });
  }

  loadUserSales = async (period) => {
    this.userSales = await userAction.getUserSales();
  };

  loadUserStocks = async () => {
    this.userStocks = await userAction.getUserStocks();
  };
}

export default new User();
