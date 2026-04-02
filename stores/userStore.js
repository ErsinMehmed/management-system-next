import { makeAutoObservable } from "mobx";
import userAction from "@/actions/userAction";

class User {
  userSales = [];
  users = [];
  distributors = [];
  isUserSalesLoad = true;

  constructor() {
    makeAutoObservable(this);
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

  loadUsers = async () => {
    const response = await userAction.getUsers();

    if (response.status) {
      this.users = response.users;
    }
  };

  loadDistributors = async () => {
    const response = await userAction.getDistributors();

    if (response.distributors) {
      this.distributors = response.distributors;
    }
  };

  hydrateDistributors = (distributors) => {
    if (distributors) this.distributors = distributors;
  };
}

export default new User();
