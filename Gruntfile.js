(function() {
  'use strict';

  var http = require('http');
  var request = require('request');
  var fs = require('fs');
  var mkdirp = require('mkdirp');

  var jsdom = require('jsdom');

  var jsDir = 'js',
      sassDir = 'sass',
      cssDir = 'css',
      imgDir = 'img',
      fontsDir = 'fonts',
      rootDir = './',
      distDir = 'dist';

  var _ = require("lodash");
  var _s = require('underscore.string');
  var matchdep = require('matchdep');

  var markdown = require( "markdown" ).markdown;
  var marked = require("marked");

  var readme = "./build/bower_components/north/README.md";
  var images = [];

  module.exports = function (grunt) {
    // Grunt task configuration
    grunt.initConfig({
      //////////////////////////////
      // Server
      //////////////////////////////
      connect: {
        server: {
          options: {
            port: 9013,
            base: './build/',
            livereload: 9016
          }
        }
      },
      //////////////////////////////
      // Open
      //////////////////////////////
      open: {
        dev: {
          path: 'http://localhost:9013'
        }
      },
      //////////////////////////////
      // Watch
      //////////////////////////////
      watch: {
        options: {
          livereload: 9016
        },
        html: {
          files: ['index.html']
        },
        gruntfile: {
          files: ['Gruntfile.js'],
          // tasks: ['build-index']
        },
        css: {
          files: [cssDir + '/**/*.css']
        },
        js: {
          files: [jsDir + '/**/*.js'],
          tasks: ['jshint'],
          options: {
            livereload: true
          }
        }
      },
      //////////////////////////////
      // Compass
      //////////////////////////////
      compass: {
        options: {
          relativeAssets: true,
          debugInfo: false,
          bundleExec: true,
          noLineComments: true,
          sassDir: sassDir,
          imagesDir: rootDir + imgDir,
          cssDir: rootDir + cssDir,
          javascriptsDir: rootDir + jsDir,
          fontsDir: rootDir + fontsDir,
          require: [
            'compass/import-once/activate',
            'breakpoint',
            'sassy-maps'
          ]
        },
        dev: {
          options: {
            cssDir: './build/' + cssDir,
            environment: 'development',
            watch: true
          }
        },
        dist: {
          options: {
            environment: 'production',
            force: true
          }
        }
      },
      //////////////////////////////
      // JSHint
      //////////////////////////////
      jshint: {
        options: {
          jshintrc: '.jshintrc'
        },
        all: [
          rootDir + jsDir + '/{,**/}*.js',
          '!' + rootDir + jsDir + '/{,**/}*.min.js'
        ]
      },
      //////////////////////////////
      // Uglify
      //////////////////////////////
      uglify: {
        dev: {
          options: {
            mangle: false,
            compress: false,
            beautify: true
          },
          files: [{
            expand: true,
            cwd: rootDir + jsDir,
            src: ['**/*.js', '!**/*.min.js'],
            dest: rootDir + jsDir,
            ext: '.js'
          }]
        },
        distSource: {
          options: {
            mangle: false,
            compress: false,
            beautify: true
          },
          files: [{
            expand: true,
            cwd: rootDir + jsDir,
            src: ['**/*.js', '!**/*.min.js'],
            dest: distDir,
            ext: '.js'
          }]
        },
        distMin: {
          options: {
            mangle: true,
            compress: true
          },
          files: [{
            expand: true,
            cwd: rootDir + jsDir,
            src: ['**/*.js', '!**/*.min.js'],
            dest: distDir,
            ext: '.min.js'
          }]
        },
        deploy: {
          options: {
            mangle: true,
            compress: true
          },
          files: [{
            expand: true,
            cwd: './js/',
            src: ['app.js'],
            dest: './js/',
            ext: '.js'
          }]
        }
      },
      //////////////////////////////
      // Compress
      //////////////////////////////
      compress: {
        dist: {
          options: {
            mode: 'gzip'
          },
          files: [{
            expand: true,
            cwd: distDir,
            src: ['**/*.min.js'],
            dest: distDir,
            ext: '.gz.js'
          }]
        }
      },
      //////////////////////////////
      // Parallel
      //////////////////////////////
      parallel: {
        dev: {
          options: {
            grunt: true,
            stream: true
          },
          tasks: ['watch', 'compass:dev']
        },
        dist: {
          options: {
            grunt: true,
            stream: true
          },
          tasks: ['uglify:distSource', 'uglify:distMin']
        }
      },
      //////////////////////////////
      // URL Crawler
      //////////////////////////////
      url_crawler: {
        default_options: {
          options: {
            includeFileSource: false
          },
          files: {
            './build/HTMLImages.JSON': ['index.html']
          }
        }
      },
      //////////////////////////////
      // CURL Directory
      //////////////////////////////
      'curl-dir': {
        long: {
          src: '<%= dom_munger.data.images %>',
          dest: './build/.tmp/images'
        }
      },
      //////////////////////////////
      // Responsive Images
      //////////////////////////////
      responsive_images: {
        build: {
          options: {
            sizes: [
              {
                name: 'small',
                width: 480,
                quality: 0,
                upscale: true
              },
              {
                name: 'medium',
                width: 720,
                quality: 0,
                upscale: true
              },
              {
                name: 'large',
                width: 1080,
                quality: 0,
                upscale: true
              },
              {
                name: 'xl',
                width: 1620,
                quality: 0,
                upscale: true
              }
            ]
          },
          files: [{
            expand: true,
            src: '**.{jpg,png}',
            cwd: './build/.tmp/images',
            custom_dest: './build/images/{%= name %}'
          }]
        }
      },
      //////////////////////////////
      // Exec
      //////////////////////////////
      exec: {
        convert_png_jpg: {
          command: 'mogrify -format jpg ./build/responsive/**/*.png'
        }
      },
      //////////////////////////////
      // Imagemin
      //////////////////////////////
      imagemin: {
        from_build: {
          options: {
            optimizationLevel: 7,
            progressive: true,
            pngquant: true
          },
          files: [{
            expand: true,
            cwd: './build/images/',
            src: ['**/*.{jpg,gif,png}'],
            dest: './build/images/'
          }]
        },
        deploy: {
          options: {
            optimizationLevel: 7,
            progressive: true,
            pngquant: true
          },
          files: [{
            expand: true,
            cwd: './images/',
            src: ['**/*.{jpg,gif,png}'],
            dest: './images/'
          }]
        }
      },
      //////////////////////////////
      // Copy
      //////////////////////////////
      copy: {
        deploy: {
          files: [{
            expand: true,
            flatten: true,
            src: ['./build/images/*.{svg,gif}'],
            dest: './images/'
          }]
        },
        usemin: {
          files: [{
            expand: true,
            flatten: true,
            src: ['./build/index.html'],
            dest: './'
          }]
        },
        build: {
          files: [{
            expand: true,
            flatten: true,
            src: ['./build/.tmp/images/*.{svg,gif}'],
            dest: './build/images/'
          }]
        }
      },
      //////////////////////////////
      // SVG Min
      //////////////////////////////
      svgmin: {
        deploy: {
          files: [{
            expand: true,
            cwd: './images/',
            src: ['**/*.svg'],
            dest: './images/'
          }]
        }
      },
      //////////////////////////////
      // Usemin
      //////////////////////////////
      useminPrepare: {
        html: './build/index.html',
        options: {
          dest: './'
        }
      },
      usemin: {
        html: './index.html',
        options: {
          dest: './'
        }
      },
      //////////////////////////////
      // DOM Munger
      //////////////////////////////
      dom_munger: {
        find_links: {
          options: {
            read: {
              selector: 'img',
              attribute: 'src',
              writeto: 'images'
            }
          },
          src: './build/index.html'
        }
      },
      //////////////////////////////
      // Inline
      //////////////////////////////
      inline: {
        dist: {
          src: ['./index.html']
        }
      },
      //////////////////////////////
      // Clean
      //////////////////////////////
      clean: {
        build_images: ['./build/images', './build/.tmp/images']
      }
    });

    // Use matchdep to load all Grunt tasks from package.json
    matchdep.filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    //////////////////////////////
    // Grunt Build HTML
    //////////////////////////////
    grunt.registerTask('build-html', function () {
      var file = grunt.file.read(readme);
      var template = grunt.file.read('templates/main.html');

      file = marked(file);
      file = file.replace(/lang-html/g, "language-markup");
      file = file.replace(/lang-/g, "language-");
      file = file.replace(/<pre><code>/g, '<pre><code class="language-markup">');

      template = template.replace("{{content}}", file);

      grunt.file.write('./build/index.html', template);
    });

    //////////////////////////////
    // Server Task
    //////////////////////////////
    grunt.registerTask('server', 'Development server', function() {
      grunt.task.run(['connect', 'build-html', 'build-images']);
      if (grunt.option('launch')) {
        grunt.task.run(['open:dev']);
      }
      grunt.task.run(['parallel:dev']);
    });

    //////////////////////////////
    // Image Replace
    //////////////////////////////
    grunt.registerTask('replace-images', function() {
      var file = grunt.file.read('./build/index.html');
      var foundImages = grunt.template.process('<%= dom_munger.data.images %>');
      foundImages = foundImages.split(',');

      _.forEach(foundImages, function(image) {
        console.log(image);
        var filename = image.replace(/^.*[\\\/]/, '');
        var ext = filename.split('.').pop();
        var replaceString = 'src="' + image +'"';

        console.log(filename);

        if (ext !== 'jpg' && ext !== 'png') {
          var replaceWith = 'src="images/' + filename + '"';

        }
        else {
          // var replaceWith = 'src="images/large/' + filename + '"';
          var replaceWith = 'data-borealis-srcs="images/small/' + filename + ', 320: images/medium/' + filename + ', 480: images/large/' + filename + ', 720: images/xl/' + filename + '"';
        }

        file = file.replace(replaceString, replaceWith);
      });

      grunt.file.write('./build/index.html', file);
    });

    //////////////////////////////
    // Build Minified Source
    //////////////////////////////
    grunt.registerTask('build-min', 'dom_munger:find_links useminPrepare concat cssmin uglify copy:usemin usemin uglify:deploy inline:dist');

    //////////////////////////////
    // Build Responsive Images
    //////////////////////////////
    grunt.registerTask('build-images', 'clean:build_images dom_munger:find_links curl-dir responsive_images:build copy:build imagemin:from_build replace-images:dom_munger.data.images');

    //////////////////////////////
    // Build Task
    //////////////////////////////
    grunt.registerTask('deploy', function() {
      mkdirp('./build');
      grunt.task.run(['url_crawler', 'copy:deploy', 'imagemin:deploy', 'svgmin:deploy']);
    });
  };
}());