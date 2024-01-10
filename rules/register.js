export function generateRegisterRules() {
  return {
    name: { required: true, minLength: 3, maxLength: 255, type: "string" },
    email: {
      required: true,
      minLength: 5,
      maxLength: 255,
      type: "string",
    },
    password: {
      required: true,
      minLength: 8,
      maxLength: 255,
      type: "string",
    },
    passwordRep: {
      required: true,
      minLength: 8,
      maxLength: 255,
      type: "string",
    },
  };
}
