var fs = require('fs');

module.exports = function (grunt) {
  'use strict';

  require('load-grunt-tasks')(grunt);
  var _ = require('lodash');

  var karmaConfig = function(configFile, customOptions) {
    var options = { configFile: configFile, keepalive: true };
    var travisOptions = process.env.TRAVIS && { browsers: ['Firefox'], reporters: 'dots' };
    return _.extend(options, customOptions, travisOptions);
  };

  // Returns configuration for bower-install plugin
  var loadTestScopeConfigurations = function () {
    var scopes = fs.readdirSync('./test_scopes').filter(function (filename) {
      return filename[0] !== '.';
    });
    var config = {
      options : {
        color : false,
        interactive : false
      }
    };
    // Create a sub config for each test scope
    for (var idx in scopes) {
      var scope = scopes[idx];
      config['test_scopes_' + scope] = {
        options : {
          cwd : 'test_scopes/' + scope,
          production : false
        }
      };
    }
    return  config;
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('bower.json'),
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    clean: {
      dist: 'dist/',
      temp: 'temp/'
    },
    watch: {
      'coffee-src': {
        files: ['src/**/*.coffee'],
        tasks: ['coffee:src']
      },
      'coffee-test': {
        files: ['test/**/*.coffee'],
        tasks: ['coffee:test']
      },
      scripts: {
        files: ['Gruntfile.js', 'temp/**/*.js', 'test/**/*.js'],
        tasks: ['jshint', 'karma:unit']
      }
    },
    jshint: {
      all: ['Gruntfile.js', 'src/**/*.js', 'test/unit/*.js'],
      options: {
        eqeqeq: true,
        globals: {
          angular: true
        }
      }
    },
    coffee: {
      src: {
        options: {
          join: true
        },
        files: {
          'temp/src/angular-vertxbus-adapter.js': [
            'src/module.coffee', 'src/wrapper.coffee', 'src/service.coffee'
          ]
        }
      },
      test: {
        options: {
          bare: true
        },
        expand: true,
        cwd: 'test/',
        src: ['unit/**/*.coffee'],
        dest: 'temp/test/',
        ext: '.js'
      }
    },
    concat: {
      src: {
        options: {
          banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n'
        },
        src: ['temp/src/**/*.js'],
        dest: 'dist/angular-vertxbus.js'
      },
      lib: {
        options: {
          banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n'
        },
        src: [
          'build-data-for-requirejs/angular-vertxbus_start.txt',
          'temp/src/**/*.js',
          'build-data-for-requirejs/angular-vertxbus_end.txt'
        ],
        dest: 'dist/requirejs/angular-vertxbus.js'
      }
    },
    uglify: {
      src: {
        files: {
          'dist/angular-vertxbus.min.js': '<%= concat.src.dest %>'
        }
      }
    },
    karma: {
      unit: {
        options: karmaConfig('karma.conf.js', {
          singleRun: true
        })
      },
      server: {
        options: karmaConfig('karma.conf.js', {
          singleRun: false
        })
      }
    },
    changelog: {
      options: {
        dest: 'CHANGELOG.md'
      }
    },
    ngmin: {
      src: {
        src: '<%= concat.src.dest %>',
        dest: '<%= concat.src.dest %>'
      },
      lib: {
        src: '<%= concat.lib.dest %>',
        dest: '<%= concat.lib.dest %>'
      }
    },

    'bower-install-simple': loadTestScopeConfigurations()

  });

  grunt.registerTask('default', ['clean:temp', 'coffee', 'jshint', 'karma:unit']);
  grunt.registerTask('test', ['coffee', 'jshint', 'karma:unit']);
  grunt.registerTask('install-test', ['bower-install-simple']);
  grunt.registerTask('test-server', ['karma:server']);
  grunt.registerTask('build', ['clean', 'coffee', 'jshint', 'karma:unit', 'concat', 'ngmin', 'uglify']);
  grunt.registerTask('release', ['changelog', 'build']);
};
