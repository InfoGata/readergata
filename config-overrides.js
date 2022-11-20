const { alias, configPaths } = require("react-app-rewire-alias");
const { override, fixBabelImports } = require("customize-cra");

module.exports = override(
  fixBabelImports("@mui/material", {
    libraryDirectory: "",
    camel2DashComponentName: false,
  }),
  fixBabelImports("@mui/icons-material", {
    libraryDirectory: "",
    camel2DashComponentName: false,
  }),
  (config) => {
    alias(configPaths("./tsconfig.paths.json"))(config);
    let loaders = config.resolve;
    loaders.fallback = {
      util: false,
    };

    return config;
  }
);
