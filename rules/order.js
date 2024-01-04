export function orderRules() {
  return {
    quantity: { required: true, type: "number", minValue: 1 },
    total_amount: { required: true, type: "number", minValue: 1 },
    price: {
      required: true,
      type: "number",
      minValue: 1,
    },
    product: {
      required: true,
      type: "string",
    },
  };
}
