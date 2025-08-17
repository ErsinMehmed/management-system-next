import { makeAutoObservable } from "mobx";
import orderAction from "@/actions/orderAction";
import { validateFields } from "@/utils";
import { orderRules as getOrderRules } from "@/rules/order";
import commonStore from "@/stores/commonStore";
import productStore from "@/stores/productStore";
import { debounce } from "lodash";

class Order {
  orders = [];
  orderData = {
    quantity: null,
    total_amount: null,
    price: null,
    date: "",
    product: "",
    message: "",
  };
  orderColumn = {
    name: "",
    order: "",
  };
  currentPage = 1;
  perPage = "10";
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
  isOrderCreated = false;

  constructor() {
    makeAutoObservable(this);
    this.debouncedLoadOrders = debounce(this.loadOrders, 300);
  }

  setOrders = (data) => {
    this.orders = data;
  };

  setOrderData = (data) => {
    this.orderData = data;
  };

  setCurrentPage = (data) => {
    this.currentPage = data;
  };

  setPerPage = (perPage) => {
    this.perPage = perPage;

    const newTotalPages = Math.ceil(
      this.orders.pagination?.total_results / perPage
    );

    this.setCurrentPage(
      this.currentPage > newTotalPages ? newTotalPages : this.currentPage
    );

    this.loadOrders(
      this.currentPage > newTotalPages ? newTotalPages : this.currentPage
    );
  };

  setOrderColumn = (data) => {
    this.orderColumn = data;

    this.loadOrders();
  };

  setIsLoading = (data) => {
    this.isLoading = data;
  };

  setSearchText = (data) => {
    this.searchText = data;
    this.setCurrentPage(1);
    this.debouncedLoadOrders();
  };

  setFilterData = (data) => {
    this.filterData = data;
  };

  setShowFilter = (data) => {
    this.showFilter = data;
  };

  loadOrders = async (newPage) => {
    this.setOrders(
      await orderAction.getOrders(
        newPage ?? this.currentPage,
        this.perPage,
        this.searchText,
        this.filterData,
        this.orderColumn
      )
    );

    this.setIsLoading(false);
  };

  clearOrderData = () => {
    this.orderData = {
      quantity: null,
      total_amount: null,
      price: null,
      product: "",
      message: "",
    };
  };

  clearFilterData = () => {
    this.setFilterData({
      dateFrom: "",
      dateTo: "",
      product: "",
      minQuantity: "",
      maxQuantity: "",
    });

    this.loadOrders();
  };

  createOrder = async () => {
    this.isOrderCreated = true;
    commonStore.resetMessages();

    const orderRules = getOrderRules();
    const errorFields = validateFields(this.orderData, orderRules);

    if (errorFields) {
      commonStore.setErrorFields(errorFields);
      this.isOrderCreated = false;

      return false;
    }

    const response = await orderAction.createOrder(this.orderData);

    if (response.status) {
      commonStore.setSuccessMessage(response.message);
      this.clearOrderData();
      this.loadOrders();
      productStore.loadProducts();
      this.isOrderCreated = false;

      return true;
    }

    this.isOrderCreated = false;

    return false;
  };

  handlePageChange = (direction) => {
    const newPage =
      direction === "next" ? this.currentPage + 1 : this.currentPage - 1;
    this.setCurrentPage(newPage);
    this.loadOrders();
  };

  handlePageClick = (page) => {
    this.setCurrentPage(page);
    this.loadOrders();
  };

  searchOrders = () => {
    commonStore.setErrorMessage("");
    this.setSearchText("");

    if (
      this.filterData?.minQuantity &&
      this.filterData?.maxQuantity &&
      Number(this.filterData?.minQuantity) >
        Number(this.filterData?.maxQuantity)
    ) {
      commonStore.setErrorMessage("Невалидено мин и макс количество");
      return;
    }

    if (
      this.filterData?.dateFrom &&
      this.filterData?.dateTo &&
      this.filterData?.dateFrom > this.filterData?.dateTo
    ) {
      commonStore.setErrorMessage("Невалиден период от време");
      return;
    }

    this.setCurrentPage(1);
    this.loadOrders();
  };

  deleteOrder = async (id) => {
    const response = await orderAction.deleteOrder(id);

    if (response.status) {
      commonStore.setSuccessMessage(response.message);
      this.loadOrders();
      productStore.loadProducts();
    }
  };
}

export default new Order();
