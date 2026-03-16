import { makeAutoObservable } from "mobx";
import commonStore from "@/stores/commonStore";

const initialOrderData = {
  phone: "",
  product: "",
  quantity: "",
  price: "",
  address: "",
  note: "",
  assignedTo: "",
  contactMethod: "",
  deliveryCost: "",
};

const STATUS_COLORS = {
  нова: "bg-blue-100 text-blue-700",
  доставена: "bg-green-100 text-green-700",
  отказана: "bg-red-100 text-red-700",
};

class ClientOrderStore {
  orders = [];
  orderData = { ...initialOrderData };
  isLoading = true;
  isCreating = false;
  currentPage = 1;
  perPage = "10";
  summary = { items: [], grandTotal: 0 };
  isSummaryLoading = false;
  history = { sellers: [], isSeller: false, grandTotal: 0, grandPayout: 0 };
  isHistoryLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  setOrders = (data) => {
    this.orders = data;
  };

  setOrderData = (data) => {
    this.orderData = data;
  };

  setCurrentPage = (page) => {
    this.currentPage = page;
  };

  setPerPage = (perPage) => {
    this.perPage = perPage;
    this.loadOrders();
  };

  clearOrderData = () => {
    this.orderData = { ...initialOrderData };
  };

  hydrateOrders = (orders) => {
    if (orders) {
      this.orders = orders;
      this.isLoading = false;
    }
  };

  loadOrders = async (page = this.currentPage) => {
    try {
      const res = await fetch(
        `/api/client-orders?page=${page}&per_page=${this.perPage}`
      );
      const data = await res.json();
      this.setOrders(data);
    } finally {
      this.isLoading = false;
    }
  };

  createOrder = async () => {
    this.isCreating = true;
    commonStore.resetMessages();

    try {
      const res = await fetch("/api/client-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.orderData),
      });
      const data = await res.json();

      if (data.status) {
        commonStore.setSuccessMessage(data.message);
        this.clearOrderData();
        this.loadOrders();
        return true;
      } else {
        commonStore.setErrorMessage(data.message);
        return false;
      }
    } finally {
      this.isCreating = false;
    }
  };

  updateStatus = async (id, status, rejectionReason = "") => {
    const res = await fetch(`/api/client-orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, rejectionReason }),
    });
    const data = await res.json();

    if (data.status) {
      commonStore.setSuccessMessage(data.message);
      this.loadOrders();
    }
  };

  loadSummary = async (from = null, to = null) => {
    this.isSummaryLoading = true;
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await fetch(`/api/client-orders/summary?${params}`);
      const data = await res.json();
      this.summary = data;
    } finally {
      this.isSummaryLoading = false;
    }
  };

  updateProductPrice = async (id, product, quantity, price, payout) => {
    const res = await fetch(`/api/client-orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product, quantity, price, payout }),
    });
    const data = await res.json();
    if (data.status) commonStore.setSuccessMessage(data.message);
    return data.status;
  };

  markAsViewed = async (id) => {
    await fetch(`/api/client-orders/${id}`, { method: "PATCH" });
  };

  loadHistory = async () => {
    this.isHistoryLoading = true;
    try {
      const res = await fetch("/api/client-orders/history");
      const data = await res.json();
      this.history = data;
    } finally {
      this.isHistoryLoading = false;
    }
  };

  markSellerAsPaid = async (sellerId) => {
    const res = await fetch("/api/client-orders/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sellerId }),
    });
    const data = await res.json();
    if (data.status) await this.loadSummary();
    return data.status;
  };

  deleteOrder = async (id) => {
    const res = await fetch(`/api/client-orders/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (data.status) {
      commonStore.setSuccessMessage(data.message);
      this.loadOrders();
    }
  };

  handlePageChange = (direction) => {
    const newPage =
      direction === "next" ? this.currentPage + 1 : this.currentPage - 1;
    this.setCurrentPage(newPage);
    this.loadOrders(newPage);
  };

  handlePageClick = (page) => {
    this.setCurrentPage(page);
    this.loadOrders(page);
  };

  getStatusColor = (status) => STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700";
}

export default new ClientOrderStore();
