import { makeObservable, observable, action } from "mobx";
import expenseAction from "@/actions/expenseAction";

class Expense {
  expenses = [];
  expensePeriod = ["Последният месец"];

  constructor() {
    makeObservable(this, {
      expenses: observable,
      expensePeriod: observable,
      setExpenses: action,
      setExpensePeriod: action,
    });
  }

  setExpenses = (data) => {
    this.expenses = data;
  };

  setExpensePeriod = (data) => {
    this.expensePeriod = data;
    this.loadExpenses(data);
  };

  loadExpenses = async (period) => {
    this.setExpenses(
      await expenseAction.getExpenses(period?.currentKey ?? this.expensePeriod)
    );
  };
}

export default new Expense();
