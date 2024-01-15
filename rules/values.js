export function valueRules() {
  return {
    diesel_price: { required: true, minValue: 1 },
    fuel_consumption: { required: true, minValue: 1 },
  };
}
