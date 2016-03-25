/*eslint-env node, commonjs */
/*eslint comma-dangle:0,no-console:0 */

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

var AVAILABLE_SCOPES = [], isValidScope, injectByScope, getAffectiveScope, isDefaultScope;

(function () {
  AVAILABLE_SCOPES = fs.readdirSync('./test_scopes').filter(function (filename) {
    return filename[0] !== '.';
  });
  isValidScope = function (scope) {
    return AVAILABLE_SCOPES.indexOf(scope) > -1;
  };
  getAffectiveScope = function (scope) {
    if (isValidScope(scope)) {
      return scope;
    } else {
      return '(default)';
    }
  };
  injectByScope = function (scope, path) {
    var prefix = '';
    // unless a scope is given, use the default resources
    if (scope && isValidScope(scope)) {
      prefix = 'test_scopes/' + scope + '/';
    }
    return prefix + 'bower_components/' + path;
  },
    isDefaultScope = function (scope) {
      return !isValidScope(scope);
    };
})();

module.exports = function (config) {

  var scope = process.env.TEST_SCOPE;
  console.log('Available test scopes: ', AVAILABLE_SCOPES);
  console.log('Currently selected scope: ', getAffectiveScope(scope));

  var vertxEventBusFile = injectByScope(scope, 'vertx3-eventbus-client/vertx-eventbus.js');

  config.set({

    // list of files / patterns to load in the browser
    files : [
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'node_modules/babel-polyfill/browser.js',
      'test/unit/test_index.js',
    ],

    frameworks : ['expect', 'mocha', 'jasmine'],

    reporters : isDefaultScope(scope) ? ['progress', 'coverage'] : ['progress'],

    preprocessors : {
      'test/unit/test_index.js' : ['webpack'],
    },

    webpack : {
      debug : true,
      devtool : 'source-map',
      //entry: [],
      resolve : {
        root : [
          path.join(__dirname, ''),
          path.join(__dirname, 'src'),
          path.join(__dirname, 'test'),
        ],
        alias : {
          'sockjs-client' : 'test/unit/mock/sockjs.js',
          'vertx-eventbus' : vertxEventBusFile
        }
      },
      module : {
        preLoaders : [
          {
            test : /\.js$/,
            exclude : [
              /(node_modules|bower_components)/,
            ],
            loader : 'babel',
            query : 'presets[]=es2015',
            plugins : [
              'transform-runtime'
            ]
          },
          {
            test : /\.js$/,
            include : [
              path.resolve('src/')
            ],
            exclude : [
              /(node_modules|bower_components)/,
            ],
            loader : 'babel-istanbul',
          },
        ],
        loaders : [
          {
            test : /vertx-eventbus\.js$/,
            loaders : [
              'imports?SockJS=sockjs-client'
            ]
          },
        ]
      },
      plugins : [
        //new JasmineWebpackPlugin(),
        new webpack.ProvidePlugin({
          'EventBus' : 'vertx-eventbus',
          'SockJS' : 'sockjs-client',
          'window.EventBus' : 'vertx-eventbus',
          'global.EventBus' : 'vertx-eventbus'
        })
      ]
    },

    webpackMiddleware : {
      noInfo : true
    },

    coverageReporter : isDefaultScope(scope) ? {
      dir : 'build/coverage',
      subdir : 'report',
      type : 'lcov'
    } : undefined,

    // web server port
    port : 9876,

    // cli runner port
    runnerPort : 9100,

    // enable / disable colors in the output (reporters and logs)
    colors : true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel : config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch : true,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers : process.env.WATCH ? [] : [process.env.TRAVIS ? 'Firefox' : 'Chrome'],

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout : 60000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun : process.env.WATCH ? false : true
  });
};
