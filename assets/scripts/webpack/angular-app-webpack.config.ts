import singleSpaAngularWebpack from 'single-spa-angular/lib/webpack';
import { Configuration } from 'webpack';
import { externalLibs } from './webpack-configurations';

const customWebpackConfig = (config: Configuration, options: any): Configuration => {
  const singleSpaWebpackConfig = singleSpaAngularWebpack(config, options);

  singleSpaWebpackConfig.externals = [...singleSpaWebpackConfig.externals, ...externalLibs];

  // Modify output.publicPath
  if (singleSpaWebpackConfig.output && singleSpaWebpackConfig.devServer) {
    singleSpaWebpackConfig.output = {
      ...singleSpaWebpackConfig.output,
      publicPath:
        singleSpaWebpackConfig.devServer.host === 'localhost'
          ? `http://localhost:${singleSpaWebpackConfig.devServer.port}/`
          : `/${singleSpaWebpackConfig.output.uniqueName}`,
    };
  }

  return singleSpaWebpackConfig;
};

export default customWebpackConfig;
