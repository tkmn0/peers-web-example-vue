module.exports = {
  root: true,
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "babel-eslint",
    sourceType: "module"
  },
  env: {
    browser: true,
    node: true,
    jest: true
  },
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended",
    "plugin:vue/recommended",
    "prettier/vue"
  ],

  // add your custom type here
  rules: {
    "no-plusplus": "off",
    "func-names": "off",
    "vue/component-name-in-template-casing": "off"
  }
};
