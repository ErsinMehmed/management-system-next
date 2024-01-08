export function sellRules() {
  return {
    quantity: { required: true, type: "number", minValue: 1 },
    price: { required: true, minValue: 1 },
    product: { required: true, type: "string" },
  };
}
