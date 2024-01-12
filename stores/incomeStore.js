import { makeObservable, observable, action } from "mobx";
import incomeAction from "@/actions/incomeAction";

class Income {
  incomes = [];

  constructor() {
    makeObservable(this, {
      incomes: observable,
      setIncomes: action,
    });
  }

  setIncomes = (data) => {
    this.incomes = data;
  };

  loadIncomes = async (period) => {
    this.setIncomes(await incomeAction.getIncomes(period));
  };
}

export default new Income();
