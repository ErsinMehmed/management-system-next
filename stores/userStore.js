import { makeObservable, observable, action } from "mobx";
import userAction from "@/actions/userAction";

class User {
  userSales = [];
  userStocks = [];
  users = [];

  constructor() {
    makeObservable(this, {
      userSales: observable,
      userStocks: observable,
      users: observable,
    });
  }

  loadUserSales = async (period) => {
    this.userSales = await userAction.getUserSales(period);
  };

  loadUserStocks = async () => {
    this.userStocks = await userAction.getUserStocks();
  };

  loadUsers = async () => {
    this.users = await userAction.getUsers();
  };
}

export default new User();
