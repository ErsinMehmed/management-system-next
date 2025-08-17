import { makeAutoObservable } from "mobx";
import sellAction from "@/actions/sellAction";
import { validateFields } from "@/utils";
import { sellRules as getSellRules } from "@/rules/sell";
import { valueRules as getValueRules } from "@/rules/values";
import commonStore from "@/stores/commonStore";
import productStore from "@/stores/productStore";
import { debounce } from "lodash";

const initialSellData = {
  quantity: null,
  mileage: null,
  price: null,
  diesel_price: null,
  fuel_consumption: null,
  additional_costs: null,
  is_wholesale: true,
  date: "",
  product: "",
  message: "",
};

const initialFilterData = {
  dateFrom: "",
  dateTo: "",
  product: "",
  minQuantity: "",
  maxQuantity: "",
};

class Sell {
  sales = [];
  sellStats = [];
  lineChartSaleStats = [];
  isLoadingLineChartStats = true;
  sellData = { ...initialSellData };
  orderColumn = {
    name: "",
    order: "",
  };
  currentPage = 1;
  fuelConsumption = null;
  dieselPrice = null;
  perPage = "10";
  isLoading = true;
  searchText = "";
  showFilter = false;
  filterData = { ...initialFilterData };
  pieChartPeriod = ["Всички резултати"];
  isSellCreated = false;

  constructor() {
    makeAutoObservable(this);
    this.debouncedLoadSales = debounce(this.loadSales, 300);
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

  setOrderColumn = (data) => {
    this.orderColumn = data;

    this.loadSales();
  };

  setIsLoading = (data) => {
    this.isLoading = data;
  };

  setSearchText = (data) => {
    this.searchText = data;
    this.setCurrentPage(1);
    this.debouncedLoadSales();
  };

  clearSearchText = () => {
    this.searchText = "";
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
    try {
      const stats = await sellAction.getStats(
        period?.currentKey ?? this.pieChartPeriod
      );
      this.setSellStats(stats);
    } finally {
      this.setIsLoading(false);
    }
  };

  loadLineChartSaleStats = async (period) => {
    try {
      this.lineChartSaleStats = await sellAction.getLineChartStats(
        period?.currentKey ?? this.pieChartPeriod
      );
    } finally {
      this.isLoadingLineChartStats = false;
    }
  };

  loadValues = async () => {
    try {
      const response = await sellAction.getValues();

      this.setFuelConsumption(response[0].fuel_consumption);
      this.setDieselPrice(response[0].diesel_price);
      this.setSellData({
        ...this.sellData,
        diesel_price: response[0].diesel_price,
        fuel_consumption: response[0].fuel_consumption,
      });
    } catch {
      commonStore.setErrorMessage("Грешка при зареждане на стойностите");
    }
  };

  loadSales = async (page = this.currentPage) => {
    try {
      const sales = await sellAction.getSales(
        page,
        this.perPage,
        this.searchText,
        this.filterData,
        this.orderColumn
      );
      this.setSales(sales);
    } catch {
      commonStore.setErrorMessage("Неуспешно зареждане на продажбите");
    } finally {
      this.setIsLoading(false);
    }
  };

  clearSellData = () => {
    this.sellData = {
      ...initialSellData,
      diesel_price: this.dieselPrice,
      fuel_consumption: this.fuelConsumption,
    };
  };

  clearFilterData = () => {
    this.setFilterData({ ...initialFilterData });
    this.loadSales();
  };

  createSell = async () => {
    this.isSellCreated = true;
    commonStore.resetMessages();

    const sellRules = getSellRules();
    const errorFields = validateFields(this.sellData, sellRules);

    if (errorFields) {
      commonStore.setErrorFields(errorFields);
      this.isSellCreated = false;

      return false;
    }

    const response = await sellAction.createSell(this.sellData);

    if (response.status) {
      commonStore.setSuccessMessage(response.message);
      this.clearSellData();
      productStore.loadProducts();
      this.loadSales();
      this.isSellCreated = false;

      return true;
    } else if (!response.status) {
      commonStore.setErrorMessage(response.message);
      this.isSellCreated = false;
    }

    this.isSellCreated = false;

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

  hasInvalidQuantityRange = () => {
    const { minQuantity, maxQuantity } = this.filterData;

    return (
      minQuantity && maxQuantity && Number(minQuantity) > Number(maxQuantity)
    );
  };

  hasInvalidDateRange = () => {
    const { dateFrom, dateTo } = this.filterData;

    return dateFrom && dateTo && dateFrom > dateTo;
  };

  searchSales = () => {
    commonStore.setErrorMessage("");
    this.clearSearchText();

    if (this.hasInvalidQuantityRange()) {
      commonStore.setErrorMessage("Невалидено мин и макс количество");

      return;
    }

    if (this.hasInvalidDateRange()) {
      commonStore.setErrorMessage("Невалиден период от време");

      return;
    }

    this.setCurrentPage(1);
    this.loadSales();
  };

  deleteSell = async (id) => {
    try {
      const response = await sellAction.deleteSell(id);

      if (response.status) {
        commonStore.setSuccessMessage(response.message);
        this.loadSales();
        productStore.loadProducts();
      }
    } catch (error) {
      commonStore.setErrorMessage("Неуспешно изтриване на грешката");
    }
  };

  updateValues = async (id, data) => {
    commonStore.resetMessages();

    const valueRules = getValueRules();
    const errorFields = validateFields(data, valueRules);

    if (errorFields) {
      commonStore.setErrorFields(errorFields);

      return false;
    }

    const response = await sellAction.updateValue(id, data);

    if (response.status) {
      commonStore.setSuccessMessage(response.message);
      this.loadValues();

      return true;
    }

    return false;
  };
}

export default new Sell();
