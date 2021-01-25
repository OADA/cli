import * as webpack from 'webpack';
import * as path from 'path';

import glob from 'glob';

// @ts-ignore
import { WebpackPnpExternals } from 'webpack-pnp-externals';

// Make each command its own entry point?
const commands = glob.sync('./src/**/commands/**/*.ts');
const entry: webpack.Entry = {};
for (const command of commands) {
  const name = path.basename(command).replace(/\.ts$/, '');
  entry[name] = command;
}

const config: webpack.Configuration = {
  mode: 'development',
  devtool: 'inline-source-map',
  target: 'node',
  entry,
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          compilerOptions: {
            sourceMap: false,
            inlineSourceMap: true,
            module: 'ESNext',
            moduleResolution: 'node',
          },
        },
      },
      { test: /\.pnp\.js$/, use: 'shebang-loader' },
      { test: /\.js$/, enforce: 'pre', use: 'source-map-loader' },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  //externals: [WebpackPnpExternals()],
};

export default config;
