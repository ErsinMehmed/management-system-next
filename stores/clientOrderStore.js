import { makeAutoObservable } from "mobx";
import commonStore from "@/stores/commonStore";
import { debounce } from "@/utils";

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
  product2: "",
  quantity2: "",
  price2: "",
  distributorPayout: "",
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
  perPage = "9";
  summary = { items: [], grandTotal: 0 };
  isSummaryLoading = false;
  history = { sellers: [], isSeller: false, grandTotal: 0, grandPayout: 0 };
  isHistoryLoading = false;
  stock = { sellers: [] };
  isStockLoading = false;
  isLoadingMore = false;

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

  loadMoreOrders = async () => {
    if (this.isLoadingMore) return;
    const nextPage = (this.orders.pagination?.current_page ?? 0) + 1;
    if (nextPage > (this.orders.pagination?.total_pages ?? 1)) return;

    this.isLoadingMore = true;
    try {
      const res = await fetch(`/api/client-orders?page=${nextPage}&per_page=${this.perPage}`);
      const data = await res.json();
      this.orders = { ...data, items: [...(this.orders.items ?? []), ...(data.items ?? [])] };
    } finally {
      this.isLoadingMore = false;
    }
  };

  _fetchOrders = async (page = this.currentPage) => {
    this.isLoading = true;

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

  loadOrders = debounce((page) => this._fetchOrders(page), 300);

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

  updateProductPrice = async (id, product, quantity, price, payout, secondProduct = undefined, distributorPayout = undefined) => {
    const res = await fetch(`/api/client-orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product, quantity, price, payout, secondProduct, distributorPayout }),
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

  confirmRevenue = async (sellerId, paidAt) => {
    // Оптимистичен update
    const sellers = this.history.sellers.map((s) => {
      if (String(s.sellerId) !== String(sellerId)) return s;
      return {
        ...s,
        payments: s.payments.map((p) =>
          String(p.paidAt) === String(paidAt) ? { ...p, revenueConfirmed: true } : p
        ),
      };
    });
    this.history = { ...this.history, sellers };

    const res = await fetch("/api/client-orders/payment-confirm", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sellerId, paidAt }),
    });
    const data = await res.json();
    if (!data.status) await this.loadHistory();
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

  loadStock = async () => {
    this.isStockLoading = true;
    try {
      const res = await fetch("/api/seller-stock");
      const data = await res.json();
      this.stock = data;
    } finally {
      this.isStockLoading = false;
    }
  };

  saveSellerStock = async (sellerId, products) => {
    const res = await fetch("/api/seller-stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sellerId, products }),
    });
    const data = await res.json();
    if (data.status) await this.loadStock();
    return data.status;
  };

  updateStock = async (stockId, stock) => {
    const res = await fetch("/api/seller-stock", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockId, stock }),
    });
    const data = await res.json();
    if (data.status) await this.loadStock();
    return data.status;
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
