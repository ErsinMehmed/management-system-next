import { makeObservable, observable, action } from "mobx";
import userAction from "@/actions/userAction";

class User {
  userSales = [];

  constructor() {
    makeObservable(this, {
      userSales: observable,
    });
  }

  loadUserSales = async (period) => {
    this.userSales = await userAction.getUserSales();
  };
}

export default new User();
