const { merge } = require('webpack-merge');
const singleSpaDefaults = require('webpack-config-single-spa-ts');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const { composePlugins, withNx } = require('@nx/webpack');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = composePlugins(withNx(), (webpackConfigEnv, argv) => {
  const orgName = 'antonio';
  const defaultConfig = singleSpaDefaults({
    orgName,
    projectName: 'root-config',
    webpackConfigEnv,
    argv,
    disableHtmlGeneration: true,
    // This is the new option that preserves backwards compatibility
    outputSystemJS: true,
  });

  const { SERVER_PORT } = process.env;

  const isLocal = argv.configuration?.includes('local');
  const assetsFolder = path.resolve(`dist/apps/root-config/assets`);

  defaultConfig.devServer.onListening = () => console.log(`Started Root Config Server on ${SERVER_PORT}`);

  const antonioCustomConfig = merge(defaultConfig, {
    // modify the webpack config however you'd like to by adding to this object
    context: path.resolve('apps', 'root-config'),
    entry: path.resolve('apps', 'root-config', 'src', 'root-config'),
    output: {
      path: path.resolve('dist', 'apps', 'root-config'),
    },
    stats: {
      colors: false,
    },
    devServer: {
      port: SERVER_PORT,
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve('node_modules/single-spa/lib/es2015/system/single-spa.min.js'),
            to: `${assetsFolder}`,
          },
          {
            from: path.resolve('node_modules/regenerator-runtime/runtime.js'),
            to: `${assetsFolder}`,
          },
          {
            from: path.resolve('node_modules/zone.js/fesm2015/zone.min.js'),
            to: `${assetsFolder}`,
          },
          {
            from: path.resolve('node_modules/systemjs/dist/system.min.js'),
            to: `${assetsFolder}`,
          },
        ],
      }),
      new HtmlWebpackPlugin({
        inject: false,
        template: 'src/index.ejs',
        templateParameters: {
          isLocal,
          orgName,
          assetsBasePath: isLocal ? '/assets' : '/assets/root-config',
          //styleBasePath: isLocal ? 'http://localhost:5200' : '/assets/styleguide-lib',
          deployDate: new Date().getTime(),
        },
      }),

      new webpack.DefinePlugin({
        'process.env.DEPLOY_DATE': new Date().getTime(),
        STYLE_BASE_PATH: JSON.stringify(isLocal ? 'http://localhost:5200' : '/assets/styleguide-lib'),
      }),
    ],
  });

  if (argv.context && ['dev', 'prod', 'pre-prod'].includes(argv.context.configurationName)) {
    return merge(antonioCustomConfig, {
      output: {
        filename: '[name].[contenthash].js',
      },
    });
  }

  return antonioCustomConfig;
});
