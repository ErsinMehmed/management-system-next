import { makeObservable, observable, action } from "mobx";
import incomeAction from "@/actions/incomeAction";
import commonStore from "./commonStore";

class Income {
  incomes = [];
  additionalIncomes = [];

  constructor() {
    makeObservable(this, {
      incomes: observable,
      additionalIncomes: observable,
      setIncomes: action,
      setAdditionalIncomes: action,
    });
  }

  setIncomes = (data) => {
    this.incomes = data;
  };

  setAdditionalIncomes = (data) => {
    this.additionalIncomes = data;
  };

  loadIncomes = async (period) => {
    const response = await incomeAction.getIncomes(period);

    if (response.status) {
      this.setIncomes(response);
    } else {
      commonStore.setErrorMessage(response.message);
    }
  };

  loadAdditionalIncomes = async (period) => {
    const response = await incomeAction.getAdditonalIncomes(period);

    this.setAdditionalIncomes(response);
  };
}

export default new Income();
