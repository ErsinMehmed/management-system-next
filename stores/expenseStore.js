import { makeAutoObservable } from "mobx";
import expenseAction from "@/actions/expenseAction";

class Expense {
  expenses = [];
  productExpenses = [];
  fuelExpenses = [];
  additionalExpenses = [];

  constructor() {
    makeAutoObservable(this);
  }

  setExpenses = (data) => {
    this.expenses = data;
  };

  loadExpenses = async (period) => {
    this.setExpenses(await expenseAction.getExpenses(period));
  };

  loadProductExpenses = async (period) => {
    const response = await expenseAction.getProductExpenses(period);

    if (response.status) {
      this.productExpenses = response.total_cost;
    }
  };

  loadFuelExpenses = async (period) => {
    const response = await expenseAction.getFuelExpenses(period);

    if (response.status) {
      this.fuelExpenses = response.total_fuel_price;
    }
  };

  loadAdditionalExpenses = async (period) => {
    const response = await expenseAction.getAdditionalExpenses(period);

    if (response.status) {
      this.additionalExpenses = response.total_additional_costs;
    }
  };
}

export default new Expense();
