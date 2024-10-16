import { makeObservable, observable, action } from "mobx";
import userAction from "@/actions/userAction";

class User {
  userSales = [];
  userStocks = [];
  users = [];
  isUserSalesLoad = true;

  constructor() {
    makeObservable(this, {
      userSales: observable,
      userStocks: observable,
      users: observable,
      isUserSalesLoad: observable,
    });
  }

  loadUserSales = async (period) => {
    try {
      this.userSales = await userAction.getUserSales(period);
    } finally {
      this.isUserSalesLoad = false;
    }
  };

  loadUserStocks = async () => {
    this.userStocks = await userAction.getUserStocks();
  };

  loadUsers = async () => {
    this.users = await userAction.getUsers();
  };
}

export default new User();
