import { makeObservable, observable, action } from "mobx";
import incomeStore from "./incomeStore";
import expenseStore from "./expenseStore";

class Common {
  errorFields = {};
  errorMessage = "";
  successMessage = "";
  isLoading = false;
  dashboardBoxPeriod = {
    period: "Последният месец",
    dateFrom: "",
    dateTo: "",
  };

  constructor() {
    makeObservable(this, {
      errorFields: observable,
      errorMessage: observable,
      successMessage: observable,
      isLoading: observable,
      dashboardBoxPeriod: observable,
      setErrorFields: action,
      setErrorMessage: action,
      setSuccessMessage: action,
      setIsLoading: action,
      setDashboardBoxPeriod: action,
    });
  }

  setErrorFields = (errorFields) => {
    this.errorFields = errorFields;
  };

  setErrorMessage = (errorMessage) => {
    this.errorMessage = errorMessage;
  };

  setSuccessMessage = (successMessage) => {
    this.successMessage = successMessage;
  };

  setIsLoading = (isLoading) => {
    this.isLoading = isLoading;
  };

  setDashboardBoxPeriod = (data) => {
    this.dashboardBoxPeriod = data;
    incomeStore.loadIncomes(data);
    expenseStore.loadExpenses(data);
  };
}

export default new Common();
