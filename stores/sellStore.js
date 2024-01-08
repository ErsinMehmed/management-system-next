import { makeObservable, observable, action } from "mobx";
import sellAction from "@/actions/sellAction";
import { validateFields } from "@/utils";
import { sellRules as getSellRules } from "@/rules/sell";
import commonStore from "./commonStore";

class Sell {
  sales = [];
  sellData = {
    quantity: null,
    mileage: null,
    fuel: null,
    price: null,
    diesel_price: 2.6,
    fuel_consumption: 6.5,
    additional_costs: null,
    date: "",
    product: "",
    message: "",
  };
  currentPage = 1;
  perPage = 10;
  isLoading = true;
  searchText = "";
  showFilter = false;
  filterData = {
    dateFrom: "",
    dateTo: "",
    product: "",
    minQuantity: "",
    maxQuantity: "",
  };

  constructor() {
    makeObservable(this, {
      sales: observable,
      sellData: observable,
      currentPage: observable,
      perPage: observable,
      isLoading: observable,
      searchText: observable,
      filterData: observable,
      showFilter: observable,
      setSales: action,
      setSellData: action,
      setCurrentPage: action,
      setPerPage: action,
      setIsLoading: action,
      setSearchText: action,
      setFilterData: action,
      setShowFilter: action,
    });
  }

  setSales = (data) => {
    this.sales = data;
  };

  setSellData = (data) => {
    this.sellData = data;
  };

  setCurrentPage = (data) => {
    this.currentPage = data;
  };

  setPerPage = (perPage) => {
    this.perPage = perPage;

    const newTotalPages = Math.ceil(
      this.sales.pagination?.total_results / perPage
    );

    this.setCurrentPage(
      this.currentPage > newTotalPages ? newTotalPages : this.currentPage
    );

    this.loadSales(
      this.currentPage > newTotalPages ? newTotalPages : this.currentPage
    );
  };

  setIsLoading = (data) => {
    this.isLoading = data;
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

  loadSales = async (newPage) => {
    this.setSales(
      await sellAction.getSales(
        newPage ?? this.currentPage,
        this.perPage,
        this.searchText,
        this.filterData
      )
    );

    this.setIsLoading(false);
  };

  clearSellData = () => {
    this.sellData = {
      quantity: null,
      mileage: 6,
      fuel: null,
      price: null,
      diesel_price: 2.6,
      fuel_consumption: 6.5,
      additional_costs: null,
      date: "",
      product: "",
      message: "",
    };
  };

  createSell = async () => {
    commonStore.setErrorFields({});
    commonStore.setErrorMessage("");
    commonStore.setSuccessMessage("");

    const sellRules = getSellRules();
    const errorFields = validateFields(this.sellData, sellRules);

    if (errorFields) {
      commonStore.setErrorFields(errorFields);
      return false;
    }

    const response = await sellAction.createSell(this.sellData);

    if (response.status) {
      commonStore.setSuccessMessage(response.message);
      this.clearSellData();
      this.loadSales();

      return true;
    } else if (!response.status) {
      commonStore.setErrorMessage(response.message);

      return false;
    }

    return false;
  };

  handlePageChange = (direction) => {
    const newPage =
      direction === "next" ? this.currentPage + 1 : this.currentPage - 1;
    this.setCurrentPage(newPage);
    this.loadSales();
  };

  handlePageClick = (page) => {
    this.setCurrentPage(page);
    this.loadSales();
  };

  searchSales = () => {
    this.setSearchText("");
    this.setCurrentPage(1);
    this.loadSales();
  };

  deleteSell = async (id) => {
    const response = await sellAction.deleteSell(id);

    if (response.status) {
      commonStore.setSuccessMessage(response.message);
      this.loadSales();
    }
  };
}

export default new Sell();
