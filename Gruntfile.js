/*eslint-env node, commonjs */
/*eslint comma-dangle:0 */

const fs = require('fs');

module.exports = function (grunt) {
  'use strict';

  require('load-grunt-tasks')(grunt);

  // Returns configuration for bower-install plugin
  var loadTestScopeConfigurations = function () {
    var scopes = fs.readdirSync('./test_scopes').filter(function (filename) {
      return typeof filename === 'string' && filename[0] !== '.';
    });
    var config = {
      options : {
        color : false,
        interactive : false
      }
    };
    // Create a sub config for each test scope
    for (var idx in scopes) {
      if (scopes.hasOwnProperty(idx)) {
        var scope = scopes[idx];
        config['test_scopes_' + scope] = {
          options : {
            cwd : 'test_scopes/' + scope,
            production : false
          }
        };
      }
    }
    return config;
  };

  grunt.initConfig({
    pkg : grunt.file.readJSON('package.json'),
    meta : {
      banner : '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= pkg.license %> */'
    },
    clean : {
      dist : 'dist/',
      temp : 'temp/'
    },
    eslint : {
      chore: {
        src : ['Gruntfile.js'],
        options: {
          configFile: 'Gruntfile.eslint.json'
        }
      },
      src: {
        src : ['src/**/*.js']
      },
      test: {
        src : ['test/unit/*.js']
      }
    },
    concat : {
      'dist.polyfill' : {
        src : [
          'node_modules/babel-polyfill/dist/polyfill.js',
          'dist/angular-vertxbus.js'
        ],
        dest : 'dist/angular-vertxbus.withpolyfill.js'
      },
      'dist.min.polyfill' : {
        src : [
          'node_modules/babel-polyfill/dist/polyfill.min.js',
          'dist/angular-vertxbus.min.js'
        ],
        dest : 'dist/angular-vertxbus.withpolyfill.min.js'
      },
    },
    conventionalChangelog : {
      options : {
        changelogOpts : {
          // conventional-changelog options go here
          preset : 'angular'
        }
      },
      release : {
        src : 'CHANGELOG.md'
      }
    },
    ngdocs : {
      options : {
        dest : 'dist/docs',
        html5Mode : false,
        startPage : '/api/knalli.angular-vertxbus',
        scripts : [
          'angular.js',
          'docs/github-badge.js'
        ]
      },
      api : ['src/**/*.js']
    },

    'bower-install-simple' : loadTestScopeConfigurations()

  });

  // Compile and test (use "build" for dist/*)
  grunt.registerTask('default', [
    'clean',
    'eslint',
    'karma:unit'
  ]);

  // Linting
  grunt.registerTask('lint', [
    'eslint'
  ]);

  grunt.registerTask('install-test', [
    'bower-install-simple'
  ]);

  grunt.registerTask('docs', [
    'ngdocs:api'
  ]);

  // Building & releasing
  grunt.registerTask('build-post', [
    'concat:dist.polyfill',
    'concat:dist.min.polyfill',
  ]);
  grunt.registerTask('release', [
    'conventionalChangelog',
  ]);
};
