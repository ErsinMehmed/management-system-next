export function sellRules() {
  return {
    quantity: { required: true, type: "number", minValue: 1 },
    mileage: { required: true, type: "number", minValue: 1 },
    fuel_price: { required: true, type: "number", minValue: 1 },
    price: { required: true, type: "number", minValue: 1 },
    product: { required: true, type: "string" },
  };
}
