import { composePlugins, withNx } from '@nx/webpack';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { merge } from 'webpack-merge';
import { externalLibs } from './webpack-configurations';

const path = require('path');
const { withReact } = require('@nx/react');
const CopyPlugin = require('copy-webpack-plugin');
const singleSpaDefaults = require('webpack-config-single-spa-react-ts');

module.exports = composePlugins(withNx(), withReact(), (webpackConfigEnv, argv) => {
  const projectName = argv.context.projectName;
  const defaultConfig = singleSpaDefaults({
    orgName: 'antonio',
    orgPackagesAsExternal: false,
    projectName: `${projectName}`,
    webpackConfigEnv,
    argv,
    // This is the new option that preserves backwards compatibility
    outputSystemJS: true,
  });

  const { SERVER_PORT } = process.env;
  defaultConfig.devServer.onListening = () => console.log(`Started React App Server on ${SERVER_PORT}`);
  const isLocal = argv.configuration?.includes('local');
  const assetsFolder = path.resolve(`dist/apps/${projectName}/assets`);
  const optimizeBuild = !isLocal
    ? {
        mode: 'production',
        optimization: {
          minimize: true, // Ensure minification is enabled
        },
      }
    : {};

  const amusnetCustomConfig = merge(defaultConfig, {
    ...optimizeBuild,
    context: path.resolve('apps', `${projectName}`),
    entry: path.resolve('apps', `${projectName}`, 'src', 'main-single-spa.tsx'),
    output: {
      path: path.resolve('dist', 'apps', `${projectName}`),
      filename: '[name].js',
      publicPath: isLocal ? `http://localhost:${SERVER_PORT}/` : `/${defaultConfig.projectName}`,
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
            from: './src/assets/translations/**/*.json',
            to: `${assetsFolder}/translations/[name][ext]`,
          },
        ],
      }),
    ],

    resolve: {
      alias: webpackConfigEnv.resolve!.alias,
      plugins: [new TsconfigPathsPlugin({})],
    },

    module: {
      rules: [
        {
          test: /\.(sass|scss)$/,
          use: [
            'style-loader',
            'css-loader',
            'postcss-loader',
            {
              loader: 'sass-loader',
              options: {
                api: 'modern-compiler',
                implementation: require('sass'),
              },
            },
          ],
        },
        {
          test: /\.(png|jpe?g|gif)$/i,
          use: [
            {
              loader: 'file-loader',
            },
          ],
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loader: 'ts-loader',
        },
      ],
    },
  });

  amusnetCustomConfig.externals = [...amusnetCustomConfig.externals, ...externalLibs];

  if (argv.context && ['dev', 'prod', 'pre-prod'].includes(argv.context.configurationName!)) {
    return merge(amusnetCustomConfig, {
      output: {
        ...amusnetCustomConfig.output,
        filename: '[name].[contenthash].js',
      },
    });
  }

  return amusnetCustomConfig;
});
