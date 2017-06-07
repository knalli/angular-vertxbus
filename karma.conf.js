/*eslint-env node, commonjs */
/*eslint comma-dangle:0,no-console:0 */

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const browserslist = require('browserslist');

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

/**
 * Configuration set for SauceLabs browser tests
 * @type {{enabled, launchers, buildOptions}}
 */
const sourcelabsConfig = ((browsers) => {

  const enabled = !!process.env.SAUCE_ENABLED;

  // parse list of browsers (by browserslist) and build a useful list
  const launchers = browsers
    .map((string) => {
      let [name, version] = string.split(' ');
      return {
        name,
        version,
      };
    })
    .filter(browser => {
      switch (browser.name) {
        case 'chrome':
        case 'edge':
        case 'firefox':
        case 'ie':
        case 'opera':
        case 'safari':
          return true;
        default:
          return false;
      }
    })
    .map(browser => {
      switch (browser.name) {
        case 'chrome':
          return {
            id : `sl_${browser.name}_${browser.version}`,
            base : 'SauceLabs',
            browserName : browser.name,
            platform : 'Windows 7',
            version : browser.version
          };
        case 'firefox':
          return {
            id : `sl_${browser.name}_${browser.version}`,
            base : 'SauceLabs',
            browserName : browser.name,
            platform : 'Windows 7',
            version : browser.version
          };
        case 'ie':
          return {
            id : `sl_${browser.name}_${browser.version}`,
            base : 'SauceLabs',
            browserName : 'internet explorer',
            platform : 'Windows 7',
            version : browser.version
          };
        case 'edge':
          return {
            id : `sl_${browser.name}_${browser.version}`,
            base : 'SauceLabs',
            browserName : 'microsoftedge',
            platform : 'Windows 10',
            version : browser.version
          };
        case 'safari':
          // skip 9
          if (browser.version.substring(0, 1) === '9') {
            break;
          }
          return {
            id : `sl_${browser.name}_${browser.version}`,
            base : 'SauceLabs',
            browserName : browser.name,
            platform : 'macOS 10.12',
            version : browser.version
          };
      }
    })
    .filter(browser => browser);

  const buildOptions = (scope) => {
    return {
      testName : `angular-vertxbus Unit Tests, scope: ${scope}`,
      verbose : true,
      doctor : true,
      logger : console.log
    };
  };

  return {
    enabled,
    launchers,
    buildOptions,
  };
})(browserslist('last 2 versions, Firefox ESR'));

module.exports = function (config) {

  const scope = process.env.TEST_SCOPE;
  const actualScope = getAffectiveScope(scope);
  console.log('Available test scopes: ', AVAILABLE_SCOPES);
  console.log('Currently selected scope: ', actualScope);

  var vertxEventBusFile = injectByScope(scope, 'vertx3-eventbus-client/vertx-eventbus.js');

  config.set({

    // list of files / patterns to load in the browser
    files : [
      injectByScope(scope, 'angular/angular.js'),
      injectByScope(scope, 'angular-mocks/angular-mocks.js'),
      'test/unit/util/unhandledRejectionTracing.js',
      'node_modules/babel-polyfill/browser.js',
      'test/unit/test_index.js',
    ],

    frameworks : ['expect', 'mocha', 'jasmine'],

    reporters : (() => {
      let reporters = ['progress'];
      if (isDefaultScope(scope)) {
        reporters.push('coverage');
      }
      if (sourcelabsConfig.enabled) {
        reporters.push('saucelabs');
      }
      return reporters;
    })(),

    preprocessors : {
      'test/unit/test_index.js' : ['webpack'],
    },

    // SourceLabs
    // https://oligofren.wordpress.com/2014/05/27/running-karma-tests-on-browserstack/
    // http://stackoverflow.com/questions/24093155/karma-sauce-launcher-disconnects-every-test-run-resulting-in-failed-runs-with-ie
    sauceLabs : ((scope) => {
      if (sourcelabsConfig.enabled) {
        return sourcelabsConfig.buildOptions(scope);
      }
    })(actualScope),
    customLaunchers : (() => {
      if (sourcelabsConfig.enabled) {
        return sourcelabsConfig.launchers;
      }
    })(),
    browserDisconnectTimeout : (() => {
      if (sourcelabsConfig.enabled) {
        return 10000; // default 2000
      }
    })(),
    browserDisconnectTolerance : (() => {
      if (sourcelabsConfig.enabled) {
        return 1; // default 0
      }
    })(),
    browserNoActivityTimeout : (() => {
      if (sourcelabsConfig.enabled) {
        return 5 * 60 * 1000; // default 10000
      }
    })(),

    webpack : {
      devtool : 'source-map',
      //entry: [],
      resolve : {
        modules : [
          path.join(__dirname, ''),
          path.join(__dirname, 'src'),
          path.join(__dirname, 'test'),
          'node_modules'
        ],
        alias : {
          'sockjs-client' : 'test/unit/mock/sockjs.js',
          'vertx-eventbus' : vertxEventBusFile
        }
      },
      module : {
        rules : [
          {
            enforce : 'pre',
            test : /\.js$/,
            exclude : [
              /(node_modules|bower_components)/,
            ],
            loader : 'babel-loader',
            options : {
              presets : ['env'],
              plugins : ['transform-runtime'],
            },
          },
          // {
          //   enforce : 'pre',
          //   test : /\.js$/,
          //   include : [
          //     path.resolve('src/')
          //   ],
          //   exclude : [
          //     /(node_modules|bower_components)/,
          //   ],
          //   loader : 'babel-istanbul-loader',
          // },
          {
            test : /vertx-eventbus\.js$/,
            loader : 'imports-loader',
            options : {
              'SockJS' : 'sockjs-client',
            },
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

    coverageReporter : (() => {
      if (isDefaultScope(scope)) {
        return {
          dir : 'build/coverage',
          subdir : 'report',
          type : 'lcov'
        };
      }
    })(),

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
    browsers : (() => {
      if (process.env.WATCH) {
        return [];
      }

      let browsers = [];
      if (sourcelabsConfig.enabled) {
        browsers = [...browsers, ...Object.keys(sourcelabsConfig.launchers)];
      } else if (process.env.TRAVIS) {
        browsers.push('Firefox');
      } else {
        if (process.env.NO_HEADLESS) {
          browsers.push('Chrome');
        } else {
          browsers.push('ChromeHeadless');
        }
      }
      return browsers;
    })(),

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout : (() => {
      if (sourcelabsConfig.enabled) {
        return 5 * 60 * 1000; // default 60000
      } else {
        return 1 * 60 * 1000;
      }
    })(),

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun : process.env.WATCH ? false : true
  });
};
