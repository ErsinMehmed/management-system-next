export function productRules() {
  return {
    price: { required: true, type: "number", minValue: 1 },
    sell_prices: { required: true },
    availability: { required: true },
  };
}
