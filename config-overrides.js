const {alias, configPaths} = require('react-app-rewire-alias')
const { override } = require('customize-cra');

module.exports =override(
  (config) => {
    alias(configPaths('./tsconfig.paths.json'))(config)

    return config;
  }
)