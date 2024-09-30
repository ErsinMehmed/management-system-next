import { makeObservable, observable, action } from "mobx";
import incomeAction from "@/actions/incomeAction";
import commonStore from "./commonStore";

class Income {
  incomes = [];
  additionalIncomes = [];
  averageProfitData = [];
  isLoadingAverageProfit = true;

  constructor() {
    makeObservable(this, {
      incomes: observable,
      additionalIncomes: observable,
      averageProfitData: observable,
      isLoadingAverageProfit: observable,
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
    const response = await incomeAction.getAdditionalIncomes(period);

    this.setAdditionalIncomes(response);
  };

  loadAverageProfit = async (period) => {
    try {
      this.averageProfitData = await incomeAction.getAverageProfit(period);
    } finally {
      this.isLoadingAverageProfit = false;
    }
  };
}

export default new Income();
