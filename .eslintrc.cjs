module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  rules: {
    quotes: ["error", "double", { avoidEscape: true }],
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/ban-ts-comment": "off",
    "import/order": ["warn", { alphabetize: { order: "asc" } }],
  },
  settings: {
    "import/resolver": {
      typescript: true,
      node: true,
    },
  },
};
