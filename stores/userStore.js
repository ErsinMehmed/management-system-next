import { makeObservable, observable, action } from "mobx";
import userAction from "@/actions/userAction";

class User {
  userSales = [];
  userStocks = [];
  users = [];
  disributors = [];
  isUserSalesLoad = true;

  constructor() {
    makeObservable(this, {
      userSales: observable,
      userStocks: observable,
      users: observable,
      isUserSalesLoad: observable,
      disributors: observable,
      setUsers: action,
    });
  }

  setUsers = (data) => {
    this.users = data;
  };

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
    const response = await userAction.getUsers();

    if (response.status) {
      this.users = response.users;
    }
  };

  loadDisributors = async () => {
    const response = await userAction.getDisributors();

    if (response.status) {
      this.disributors = response.disributors;
    }
  };
}

export default new User();
