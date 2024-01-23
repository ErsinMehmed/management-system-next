export function adRules() {
  return {
    platform: { required: true },
    amount: { required: true },
    date: { required: true },
  };
}
