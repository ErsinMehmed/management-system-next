import { makeObservable, observable, action } from "mobx";
import expenseAction from "@/actions/expenseAction";

class Expense {
  expenses = [];

  constructor() {
    makeObservable(this, {
      expenses: observable,
      setExpenses: action,
    });
  }

  setExpenses = (data) => {
    this.expenses = data;
  };

  loadExpenses = async (period) => {
    this.setExpenses(await expenseAction.getExpenses(period));
  };
}

export default new Expense();
