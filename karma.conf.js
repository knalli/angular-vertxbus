'use strict';

var fs = require('fs');

var AVAILABLE_SCOPES = [], isValidScope, injectByScope, getAffectiveScope, isDefaultScope;

(function(undefined){
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

module.exports = function(config) {

  var scope = process.env.TEST_SCOPE;
  console.log('Available test scopes: ', AVAILABLE_SCOPES);
  console.log('Currently selected scope: ', getAffectiveScope(scope));

  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',

    // list of files / patterns to load in the browser
    files: [
      'node_modules/karma-babel-preprocessor/node_modules/babel-core/browser-polyfill.js',
      injectByScope(scope, 'angular/angular.js'),
      injectByScope(scope, 'angular-mocks/angular-mocks.js'),
      'test/unit/mock/sockjs.js',
      injectByScope(scope, 'vertxbus.js/index.js'),
      'src/lib/**/*.js',
      'src/vertxbus-module.js',
      'src/vertxbus-wrapper.js',
      'src/vertxbus-service.js',
      'test/**/*Spec.js'
    ],

    frameworks: ['browserify', 'mocha', 'expect'],


    // list of files to exclude
    exclude: [

    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit'
    reporters: isDefaultScope(scope) ? ['progress', 'coverage'] : ['progress'],

    preprocessors: (function () {
      var config = {
        'src/**/*.js': [ 'browserify' ],
        'test/unit/mock/sockjs.js': [ 'browserify' ]
      };

      if (isDefaultScope(scope)) {
        config['src/**/*.js'].push('coverage');
      }

      return config;
    }()),

    // browserify configuration
    browserify: {
      debug: true,
      extensions: ['.js'],
      transform: [ 'babelify' ]
    },

    coverageReporter: isDefaultScope(scope) ? {
      dir: 'build/coverage',
      subdir: 'report',
      type: 'lcov'
    } : undefined,

    // web server port
    port: 9876,


    // cli runner port
    runnerPort: 9100,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [process.env.TRAVIS ? 'Firefox' : 'Chrome'],

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
