export function incomeRules() {
  return {
    distributor: { required: true },
    amount: { required: true, type: "number", minValue: 1 },
    message: { required: true, type: "string" },
  };
}
