import common from "./commonStore";
import auth from "./authStore";
import order from "./orderStore";
import product from "./productStore";
import sell from "./sellStore";
import expense from "./expenseStore";

const commonStore = common;
const authStore = auth;
const orderStore = order;
const productStore = product;
const sellStore = sell;
const expenseStore = expense;

export {
  commonStore,
  authStore,
  orderStore,
  productStore,
  sellStore,
  expenseStore,
};
