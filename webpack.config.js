/*eslint-env node, commonjs */
/*eslint comma-dangle:0 */

const webpack = require('webpack');
const NgAnnotatePlugin = require('ng-annotate-webpack-plugin');

const pkg = require('./package.json');
const banner = '' +
'/*! ' + (pkg.title || pkg.name) + ' - v' + (pkg.version) + ' - ' + (new Date().toISOString().substring(0, 10)) + '\n' +
' * ' + (pkg.homepage) + '\n' +
' * Copyright (c) ' + (new Date().toISOString().substring(0, 4)) + ' ' + (pkg.author.name) + '\n' +
' * @license ' + (pkg.license) + ' */' +
'';

const factory = function (options) {
  var minified = options.minified || false;
  var result = {
    entry : {
      'angular-vertxbus' : './src/index.js',
    },
    output : {
      filename : minified ? 'dist/[name].min.js' : 'dist/[name].js',
      libraryTarget : 'umd',
    },
    externals : [
      {
        'vertx-eventbus' : {
          root : 'EventBus',
          commonjs2 : 'vertx-eventbus',
          commonjs : 'vertx-eventbus',
          amd : 'vertx-eventbus',
        }
      }
    ],
    module : {
      preLoaders: [
        {
          test: /\.js$/,
          exclude : /(node_modules|bower_components)/,
          loader: 'eslint',
        },
      ],
      loaders : [
        {
          test : /\.js$/,
          exclude : /(node_modules|bower_components)/,
          loader : 'babel',
          query : 'presets[]=es2015',
          plugins : [
            'transform-runtime'
          ],
        },
      ]
    },
    plugins : [],
    devtool : 'source-map',
  };

  result.plugins.push(new webpack.BannerPlugin(banner, {
    raw: true,
    entryOnly: true,
  }));
  result.plugins.push(new NgAnnotatePlugin({
    add : true,
  }));
  if (minified) {
    result.plugins.push(new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
    }));
  }

  return result;
};

module.exports = factory({
  minified: process.env.BUILD_MINIFIED ? true : false
});
