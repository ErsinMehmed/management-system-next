import { makeObservable, observable, action } from "mobx";
import { incomeRules as getIncomeRules } from "@/rules/income";
import { validateFields } from "@/utils";
import incomeAction from "@/actions/incomeAction";
import commonStore from "./commonStore";

class Income {
  incomes = [];
  additionalIncomes = [];
  averageProfitData = [];
  isLoadingAverageProfit = true;
  saleIncomes = [];
  allIncomes = [];
  isLoading = true;
  currentPage = 1;
  perPage = "10";
  searchText = "";
  showFilter = false;
  orderColumn = {
    name: "",
    order: "",
  };
  filterData = {
    // dateFrom: "",
    // dateTo: "",
    // product: "",
    // minQuantity: "",
    // maxQuantity: "",
  };
  isIncomeCreated = false;

  constructor() {
    makeObservable(this, {
      incomes: observable,
      additionalIncomes: observable,
      averageProfitData: observable,
      isLoadingAverageProfit: observable,
      saleIncomes: observable,
      currentPage: observable,
      perPage: observable,
      searchText: observable,
      filterData: observable,
      showFilter: observable,
      orderColumn: observable,
      allIncomes: observable,
      isLoading: observable,
      isIncomeCreated: observable,
      setIncomes: action,
      setAdditionalIncomes: action,
      setCurrentPage: action,
      setPerPage: action,
      setSearchText: action,
      setFilterData: action,
      setShowFilter: action,
      setAllIncomes: action,
      setIsLoading: action,
    });
  }

  setSales = (data) => {
    this.sales = data;
  };

  setCurrentPage = (data) => {
    this.currentPage = data;
  };

  setPerPage = (perPage) => {
    this.perPage = perPage;

    const newTotalPages = Math.ceil(
      this.allIncomes.pagination?.total_results / perPage
    );

    this.setCurrentPage(
      this.currentPage > newTotalPages ? newTotalPages : this.currentPage
    );

    this.loadAllIncomes(
      this.currentPage > newTotalPages ? newTotalPages : this.currentPage
    );
  };

  setOrderColumn = (data) => {
    this.orderColumn = data;

    this.loadAllIncomes();
  };

  setSearchText = (data) => {
    this.searchText = data;
    this.setCurrentPage(1);
    this.loadSales();
  };

  setFilterData = (data) => {
    this.filterData = data;
  };

  setShowFilter = (data) => {
    this.showFilter = data;
  };

  setAllIncomes = (data) => {
    this.allIncomes = data;
  };

  setIncomes = (data) => {
    this.incomes = data;
  };

  setAdditionalIncomes = (data) => {
    this.additionalIncomes = data;
  };

  setIsLoading = (data) => {
    this.isLoading = data;
  };

  loadAllIncomes = async (newPage) => {
    try {
      const incomes = await incomeAction.getAllIncomes(
        newPage ?? this.currentPage,
        this.perPage,
        this.searchText,
        this.filterData,
        this.orderColumn
      );

      this.setAllIncomes(incomes);
    } finally {
      this.setIsLoading(false);
    }
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

  loadTotalSaleIncomes = async (period) => {
    const response = await incomeAction.getSaleIncomes(period);

    if (response.status) {
      this.saleIncomes = response.total_amount_sales;
    }
  };

  createIncome = async (data) => {
    this.isIncomeCreated = true;
    commonStore.setErrorFields({});
    commonStore.setErrorMessage("");
    commonStore.setSuccessMessage("");

    const incomeRules = getIncomeRules();
    const errorFields = validateFields(data, incomeRules);

    if (errorFields) {
      commonStore.setErrorFields(errorFields);
      this.isIncomeCreated = false;

      return false;
    }

    const response = await incomeAction.createIncome(data);

    if (response.status) {
      commonStore.setSuccessMessage(response.message);
      this.loadAllIncomes();
      this.isIncomeCreated = false;

      return true;
    } else if (!response.status) {
      commonStore.setErrorMessage(response.message);
      this.isIncomeCreated = false;
    }

    this.isIncomeCreated = false;

    return false;
  };

  deleteIncome = async (id) => {
    const response = await incomeAction.IncomeSell(id);

    if (response.status) {
      commonStore.setSuccessMessage(response.message);
      this.loadAllIncomes();
    }
  };

  handlePageChange = (direction) => {
    const newPage =
      direction === "next" ? this.currentPage + 1 : this.currentPage - 1;
    this.setCurrentPage(newPage);
    this.loadAllIncomes();
  };

  handlePageClick = (page) => {
    this.setCurrentPage(page);
    this.loadAllIncomes();
  };
}

export default new Income();
