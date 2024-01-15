import { makeObservable, observable, action } from "mobx";
import incomeAction from "@/actions/incomeAction";
import commonStore from "./commonStore";

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
    const response = await incomeAction.getIncomes(period);

    if (response.status) {
      this.setIncomes(response);
    } else {
      commonStore.setErrorMessage(response.message);
    }
  };
}

export default new Income();
