import { makeAutoObservable } from "mobx";
import incomeStore from "@/stores/incomeStore";
import expenseStore from "@/stores/expenseStore";

class Common {
  errorFields = {};
  errorMessage = "";
  successMessage = "";
  isLoading = false;
  dashboardBoxPeriod = {
    period: "Всички резултати",
    dateFrom: "",
    dateTo: "",
  };

  constructor() {
    makeAutoObservable(this);
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
    const allKeysHaveValues = Object.values(data).every(
      (value) => value === ""
    );

    this.dashboardBoxPeriod = allKeysHaveValues
      ? { period: "Последният месец", dateFrom: "", dateTo: "" }
      : data;
    incomeStore.setIncomes([]);
    expenseStore.setExpenses([]);
    incomeStore.loadIncomes(data);
    expenseStore.loadExpenses(data);
    incomeStore.loadAdditionalIncomes(data);
  };
}

export default new Common();
