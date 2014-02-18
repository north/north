(function() {
  'use strict';

  var http = require('http');
  var request = require('request');
  var fs = require('fs');
  var mkdirp = require('mkdirp');
  var chalk = require('chalk');

  var jsdom = require('jsdom');

  var jsDir = 'js',
      sassDir = 'sass',
      cssDir = 'css',
      imgDir = 'img',
      fontsDir = 'fonts',
      rootDir = './',
      distDir = 'dist';

  var imageThreshold = 1.05;

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
        },
        images: {
          options: {
            grunt: true,
            stream: true
          },
          tasks: ['imagemin:build', 'svgmin:build']
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
            custom_dest: './build/.tmp/rwd-images/{%= name %}'
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
        build: {
          options: {
            optimizationLevel: 10,
            progressive: true,
            pngquant: true
          },
          files: [{
            expand: true,
            cwd: './build/.tmp/rwd-images/',
            src: ['**/*.{jpg,jpeg,gif,png}'],
            dest: './build/.tmp/optim'
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
            src: ['./build/.tmp/images/*.gif'],
            dest: './build/images/'
          }]
        }
      },
      //////////////////////////////
      // SVG Min
      //////////////////////////////
      svgmin: {
        build: {
          files: [{
            expand: true,
            cwd: './build/.tmp/images/',
            src: ['**/*.svg'],
            dest: './build/images/'
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
      var regex = new RegExp(/<([^\s]+).*?id="([^"]*?)".*?>(.+?)<\/\1>/gi);
      var matches, match, parts, replace = '';
      var sectionCount = 0;


      file = marked(file);

      //////////////////////////////
      // Parse out syntax highlighting
      //////////////////////////////
      file = file.replace(/lang-html/g, "language-markup");
      file = file.replace(/lang-/g, "language-");
      file = file.replace(/<pre><code>/g, '<pre><code class="language-markup">');

      //////////////////////////////
      // Parse into sections
      //////////////////////////////
      matches = file.match(regex);
      for (var i in matches) {
        match = matches[i];
        // From http://stackoverflow.com/questions/3271061/regex-to-find-tag-id-and-content-javascript
        regex = new RegExp(/<([^\s]+).*?id="([^"]*?)".*?>(.+?)<\/\1>/gi);
        parts = regex.exec(match);

        if (parts[1] === 'h1') {
          if (sectionCount > 0) {
            replace = '</section>\n';
          }
          else {
            replace = '';
          }

          if (i > 0) {
            replace += '</article>\n';
          }
          else {
            replace += '';
          }

          replace += '<article id="' + parts[2] + '" class="base--STYLED">\n';
          if (i > 0) {
            replace += '<h1>' + parts[3] + '</h1>';
          }
          sectionCount = 0;
          file = file.replace(parts[0], replace);
        }
        else if (parts[1] === 'h2') {
          if (sectionCount > 0) {
            replace = '</section>\n';
          }
          else {
            replace = '';
          }
          replace += '<section id="' + parts[2] + '">\n';
          replace += '<' + parts[1] + '>' + parts[3] + '</' + parts[1] + '>';
          sectionCount++;
          file = file.replace(parts[0], replace);
        }
      }

      file += '\n</section></article>';


      //////////////////////////////
      // Put content into place
      //////////////////////////////
      template = template.replace("{{content}}", file);
      grunt.file.write('./build/index.html', template);

      grunt.log.writeln('Converted ' + chalk.cyan(readme) + ' to ' + chalk.cyan('./build/index.html'));
    });

    //////////////////////////////
    // Server Task
    //////////////////////////////
    grunt.registerTask('serve', 'Development server', function() {
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
      var replaceWith = '';
      var replaceText = '';

      _.forEach(foundImages, function(image) {
        var filename = image.replace(/^.*[\\\/]/, '');
        var ext = filename.split('.').pop();
        var replaceString = 'src="' + image +'"';

        if (ext !== 'jpg' && ext !== 'png') {
          replaceWith = 'src="images/' + filename + '"';
          replaceText = 'local';
          if (ext === 'svg') {
            replaceWith += ' style: {width: 100%; height: auto}';
            replaceText += ', style added for svg';
          }
          grunt.log.writeln(chalk.green('✔ ') + chalk.cyan(image) + ' replaced' + chalk.grey(' (' + replaceText + ')'));
        }
        else {
          replaceWith = 'data-borealis-srcs="images/small/' + filename + ', 320: images/medium/' + filename + ', 480: images/large/' + filename + ', 720: images/xl/' + filename + '"';
          replaceText = 'borealis';
          grunt.log.writeln(chalk.green('✔ ') + chalk.cyan(image) + ' replaced' + chalk.grey(' (borealis)'));
        }

        file = file.replace(replaceString, replaceWith);
      });

      grunt.file.write('./build/index.html', file);
      grunt.log.writeln('Updated ' + chalk.cyan('./build/index.html'));
    });

    //////////////////////////////
    // Copy by File Size
    //////////////////////////////
    grunt.registerTask('image-copy', function() {
      var foundImages = grunt.template.process('<%= dom_munger.data.images %>');
      foundImages = foundImages.split(',');

      var optim = './build/.tmp/optim/';
      var rwd = './build/.tmp/rwd-images/';
      var build = './build/images/';
      var sizes = ['small', 'medium', 'large', 'xl'];
      var szLngth = sizes.length;
      var base = '';
      var opt = '';
      var buildUrl, rwdUrl, optUrl, baseKb, optKb = '';
      var totalOptim = 0;
      var totalBase = 0;
      var totalOther = 0;
      var totalSize = {};

      for (var i = 0; i < szLngth; i++) {
        var size = sizes[i];
        totalSize[size] = 0;
      }

      _.forEach(foundImages, function(image) {
        var filename = image.replace(/^.*[\\\/]/, '');
        var ext = filename.split('.').pop();

        if (ext === 'jpg' || ext === 'png') {
          for (var i = 0; i < szLngth; i++) {
            var size = sizes[i];
            var url =  size + '/' + filename;

            buildUrl = build + url;
            rwdUrl = rwd + url;
            optUrl = optim + url;


            base = fs.statSync(rwdUrl);
            opt = fs.statSync(optUrl);

            base = base["size"];
            opt = opt["size"];

            baseKb = (base / 1024).toFixed(2);
            optKb = (opt / 1024).toFixed(2);

            if (base * imageThreshold < opt) {
              grunt.file.copy(rwdUrl, buildUrl);
              grunt.log.writeln(chalk.gray('✔ ') + filename + ' (' + size + ')' + chalk.gray(' (' + baseKb + 'kB vs ' + optKb + 'kB)'));
              totalBase++;
              totalSize[size] += base;
            }
            else {
              grunt.file.copy(optUrl, buildUrl);
              grunt.log.writeln(chalk.green('✔ ') + filename + ' (' + size + ')' + chalk.gray(' (' + optKb + 'kB vs ' + baseKb + 'kB)'));
              totalOptim++;
              totalSize[size] += opt;
            }
          }
        }
        else {
          var url = build + '/' + filename;
          base = fs.statSync(url);
          totalOther += base["size"];
        }
      });

      grunt.log.writeln('Used ' + totalOptim + ' optimized images' + chalk.gray(' (' + totalBase + ' unoptimized images)'));
      grunt.log.writeln('');

      for (var i = 0; i < szLngth; i++) {
        grunt.log.writeln(chalk.yellow((totalSize[sizes[i]] / 1024).toFixed(2) + 'kb') + ' Total file size' + chalk.gray(' (' + sizes[i] + ')'));
      }
      grunt.log.writeln(chalk.yellow((totalOther / 1024).toFixed(2) + 'kb') + ' Total file size' + chalk.gray(' (non-responsive)'));
    });
    //////////////////////////////
    // Build Minified Source
    //////////////////////////////
    grunt.registerTask('build-min', 'dom_munger:find_links useminPrepare concat cssmin uglify copy:usemin usemin uglify:deploy inline:dist');

    //////////////////////////////
    // Build Responsive Images
    //////////////////////////////
    grunt.registerTask('build-images', 'clean:build_images dom_munger:find_links curl-dir responsive_images:build copy:build parallel:images image-copy:dom_munger.data.images replace-images:dom_munger.data.images');

    //////////////////////////////
    // Refresh Task
    //////////////////////////////
    grunt.registerTask('refresh', 'build-html build-images');

    //////////////////////////////
    // Build Task
    //////////////////////////////
    grunt.registerTask('deploy', function() {
      mkdirp('./build');
      grunt.task.run(['url_crawler', 'copy:deploy', 'imagemin:deploy', 'svgmin:deploy']);
    });
  };
}());