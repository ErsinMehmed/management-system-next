import { makeObservable, observable, action } from "mobx";
import sellAction from "@/actions/sellAction";
import { validateFields } from "@/utils";
import { sellRules as getSellRules } from "@/rules/sell";
import commonStore from "./commonStore";

class Sell {
  sales = [];
  sellStats = [];
  sellData = {
    quantity: null,
    mileage: null,
    fuel: null,
    price: null,
    diesel_price: null,
    fuel_consumption: null,
    additional_costs: null,
    date: "",
    product: "",
    message: "",
  };
  currentPage = 1;
  fuelConsumption = null;
  dieselPrice = null;
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
  pieChartPeriod = ["Последният месец"];

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
      sellStats: observable,
      pieChartPeriod: observable,
      fuelConsumption: observable,
      dieselPrice: observable,
      setSales: action,
      setSellData: action,
      setCurrentPage: action,
      setPerPage: action,
      setIsLoading: action,
      setSearchText: action,
      setFilterData: action,
      setShowFilter: action,
      setSellStats: action,
      setPieChartPeriod: action,
      setFuelConsumption: action,
      setDieselPrice: action,
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

  setSellStats = (data) => {
    this.sellStats = data;
  };

  setDieselPrice = (data) => {
    this.dieselPrice = data;
  };

  setFuelConsumption = (data) => {
    this.fuelConsumption = data;
  };

  setPieChartPeriod = (data) => {
    this.pieChartPeriod = data;
    this.loadSaleStats(data);
  };

  loadSaleStats = async (period) => {
    this.setSellStats(
      await sellAction.getStats(period?.currentKey ?? this.pieChartPeriod)
    );

    this.setIsLoading(false);
  };

  loadValues = async () => {
    const response = await sellAction.getValues();

    this.setFuelConsumption(response[0].fuel_consumption);
    this.setDieselPrice(response[0].diesel_price);

    this.sellData = {
      ...this.sellData,
      diesel_price: response[0].diesel_price,
      fuel_consumption: response[0].fuel_consumption,
    };
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
      mileage: null,
      fuel: null,
      price: null,
      diesel_price: this.dieselPrice,
      fuel_consumption: this.fuelConsumption,
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
