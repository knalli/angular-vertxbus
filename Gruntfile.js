var fs = require('fs');

module.exports = function (grunt) {
  'use strict';

  require('load-grunt-tasks')(grunt);
  var _ = require('lodash');

  var karmaConfig = function (configFile, customOptions) {
    var options = {configFile : configFile, keepalive : true};
    var travisOptions = process.env.TRAVIS && {browsers : ['Firefox'], reporters : 'dots'};
    return _.extend(options, customOptions, travisOptions);
  };

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
    babel : {
      options : {
        sourceMap : false,
        sourceType : 'module'
      },
      src : {
        expand : true,
        cwd : 'src/',
        src : ['**/*.js'],
        dest : 'temp/',
        ext : '.js'
      }
    },
    karma : {
      unit : {
        options : karmaConfig('karma.conf.js', {
          singleRun : true
        })
      },
      headless : {
        options : karmaConfig('karma.conf.js', {
          singleRun : true,
          browsers : ['PhantomJS']
        })
      },
      server : {
        options : karmaConfig('karma.conf.js', {
          singleRun : false
        })
      }
    },
    watch : {
      scripts : {
        files : ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
        tasks : ['karma:unit']
      },
      lint_chore : {
        files : ['Gruntfile.js'],
        tasks : ['eslint:chore']
      },
      lint_src : {
        files : ['src/**/*.js'],
        tasks : ['eslint:src']
      },
      lint_test : {
        files : ['test/**/*.js'],
        tasks : ['eslint:test']
      },
      ngdocs : {
        files : ['src/**/*.js'],
        tasks : ['ngdocs:api']
      }
    },
    browserify : {
      dist : {
        options : {
          browserifyOptions : {
            fullPaths : false,
            debug : false // TODO enable sourcemaps
          },
          transform : ['babelify', require('browserify-ngannotate')],
          banner : '<%= meta.banner %>',
          watch : true
        },
        files : {
          'dist/angular-vertxbus.js' : [
            'src/index.js'
          ]
        }
      }
    },
    extract_sourcemap : {
      dist : {
        files : {
          'dist' : ['dist/angular-vertxbus.js']
        }
      },
      'dist-withpolyfill' : {
        files : {
          'dist' : ['dist/angular-vertxbus.withpolyfill.js']
        }
      }
    },
    uglify : {
      options : {
        preserveComments : 'some',
        sourceMap : false, // TODO enable sourcemaps
        sourceMapIn : 'dist/angular-vertxbus.js.map'
      },
      dist : {
        files : {
          'dist/angular-vertxbus.min.js' : 'dist/angular-vertxbus.js'
        }
      },
      'dist-withPolyfill' : {
        files : {
          'dist/angular-vertxbus.withpolyfill.min.js' : 'dist/angular-vertxbus.withpolyfill.js'
        }
      }
    },
    concat : {
      options : {
        stripBanners : true,
        banner : '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= pkg.license %> */\n'
      },
      'dist-withPolyfill' : {
        src : [
          'node_modules/babel-polyfill/dist/polyfill.js',
          'dist/angular-vertxbus.js'
        ],
        dest : 'dist/angular-vertxbus.withpolyfill.js'
      }
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

  grunt.loadNpmTasks('gruntify-eslint');

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

  // Testing
  grunt.registerTask('test', [
    'eslint',
    'karma:unit'
  ]);
  grunt.registerTask('install-test', [
    'bower-install-simple'
  ]);
  grunt.registerTask('test-server', [
    'karma:server'
  ]);

  grunt.registerTask('docs', [
    'ngdocs:api'
  ]);

  grunt.registerTask('watch-docs', [
    'docs', 'watch:ngdocs'
  ]);

  // Building & releasing
  grunt.registerTask('compile', [
    'browserify:dist',
    'concat:dist-withPolyfill',
    // 'extract_sourcemap:dist',// TODO enable sourcemaps
    // 'extract_sourcemap:dist-withPolyfill',// TODO enable sourcemaps
    'uglify:dist',
    'uglify:dist-withPolyfill'
  ]);
  grunt.registerTask('build', [
    'clean',
    'test',
    'package'
  ]);
  grunt.registerTask('release', [
    'conventionalChangelog',
    'build'
  ]);
};
