import { makeObservable, observable, action } from "mobx";
import expenseAction from "@/actions/expenseAction";

class Expense {
  expenses = [];
  productExpenses = [];

  constructor() {
    makeObservable(this, {
      expenses: observable,
      productExpenses: observable,
      setExpenses: action,
    });
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
}

export default new Expense();
