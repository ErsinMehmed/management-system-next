import { makeObservable, observable, action } from "mobx";
import sellAction from "@/actions/sellAction";
import { validateFields } from "@/utils";
import { sellRules as getSellRules } from "@/rules/sell";
import commonStore from "./commonStore";

class Sell {
  sells = [];
  sellData = {
    quantity: null,
    mileage: null,
    fuel: null,
    price: null,
    diesel_price: null,
    fuel_consumption: null,
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
      sells: observable,
      sellData: observable,
      currentPage: observable,
      perPage: observable,
      isLoading: observable,
      searchText: observable,
      filterData: observable,
      showFilter: observable,
      setSells: action,
      setSellData: action,
      setCurrentPage: action,
      setPerPage: action,
      setIsLoading: action,
      setSearchText: action,
      setFilterData: action,
      setShowFilter: action,
    });
  }

  setSells = (data) => {
    this.sells = data;
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
      this.sells.pagination?.total_results / perPage
    );

    this.setCurrentPage(
      this.currentPage > newTotalPages ? newTotalPages : this.currentPage
    );

    this.loadSells(
      this.currentPage > newTotalPages ? newTotalPages : this.currentPage
    );
  };

  setIsLoading = (data) => {
    this.isLoading = data;
  };

  setSearchText = (data) => {
    this.searchText = data;
    this.setCurrentPage(1);
    this.loadSells();
  };

  setFilterData = (data) => {
    this.filterData = data;
  };

  setShowFilter = (data) => {
    this.showFilter = data;
  };

  loadSells = async (newPage) => {
    this.setSells(
      await sellAction.getSells(
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
      mileage: null,
      fuel: null,
      price: null,
      diesel_price: null,
      fuel_consumption: null,
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
      this.loadSells();

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
    this.loadSells();
  };

  handlePageClick = (page) => {
    this.setCurrentPage(page);
    this.loadSells();
  };

  searchSells = () => {
    this.setSearchText("");
    this.setCurrentPage(1);
    this.loadSells();
  };

  deleteSell = async (id) => {
    const response = await sellAction.deleteSell(id);

    if (response.status) {
      commonStore.setSuccessMessage(response.message);
      this.loadSells();
    }
  };
}

export default new Sell();
