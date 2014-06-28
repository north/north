(function() {
  'use strict';
  module.exports = function (grunt) {
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
    var images = [];

    var settings = grunt.file.readYAML('./config.yml');
    var bower = grunt.file.readJSON('./.bowerrc');
    var bowerJSON = grunt.file.readJSON('bower.json');
    var northPath = bower.directory + '/north/';
    var buildHTML = [];
    var outputHTML = [];

    _.forEach(settings.docs, function(settings) {
      buildHTML.push('./build/' + settings.file + '.html');
      outputHTML.push('./' + settings.file + '.html');
    });

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
          files: buildHTML
        },
        gruntfile: {
          files: ['Gruntfile.js', 'templates/*'],
          tasks: ['refresh']
        },
        css: {
          files: ['./build/' + cssDir + '/**/*.css']
        },
        js: {
          files: [jsDir + '/**/*.js'],
          tasks: ['jshint', 'uglify:dev']
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
            'sassy-maps',
            'toolkit'
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
            dest: './build/' + jsDir,
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
                quality: 50,
                upscale: true
              },
              {
                name: 'medium',
                width: 720,
                quality: 50,
                upscale: true
              },
              {
                name: 'large',
                width: 1080,
                quality: 50,
                upscale: true
              },
              {
                name: 'xl',
                width: 1620,
                quality: 50,
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
        deployImages: {
          files: [{
            expand: true,
            flatten: false,
            cwd: './build/images/',
            src: '{,**/}*.*',
            dest: './images/'
          }]
        },
        deployHTML: {
          files: [{
            expand: true,
            flatten: true,
            src: buildHTML,
            dest: './'
          }]
        },
        usemin: {
          files: [{
            expand: true,
            flatten: true,
            src: buildHTML,
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
      // Inline CSS
      //////////////////////////////
      useminPrepare: {
        html: buildHTML,
        options: {
          dest: './'
        }
      },
      usemin: {
        html: outputHTML,
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
          src: outputHTML
        }
      },
      //////////////////////////////
      // Clean
      //////////////////////////////
      clean: {
        build_images: ['./build/images', './build/.tmp/images'],
        deploy_images: ['./images'],
        deploy_html: ['./*.html', '!./build/**/*.html'],
        deploy_assets: ['./css/style.css', './js/app.js', './js/fonts.js']
      }
    });

    // Use matchdep to load all Grunt tasks from package.json
    matchdep.filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    //////////////////////////////
    // Grunt Build HTML
    //////////////////////////////
    grunt.registerTask('build-html', function () {

      _.forEach(settings.docs, function(settings, doc) {
        var filename = settings.file;
        var toc = settings.toc;
        var lang = settings.lang;
        var dir = settings.dir;

        var file = grunt.file.read(northPath + doc);
        var template = grunt.file.read('templates/main.html');
        var regex = new RegExp(/<([^\s]+).*?id="([^"]*?)".*?>(.+?)<\/\1>/gi),
            replaceRegex = '';
        var matches, match, parts, replace = '';
        var sectionCount = 0,
            articleCount = 0,
            subCount = 0;
        var isNav = false;
        var builtNav = new Object();
            builtNav.items = new Array();
        var currentArticle = '',
            currentSection = '';
        var navOutput = '';
        var navHolder = '';
        var link = '';
        var navToRemove = 'opennav',
            navToRemoveStart = 0,
            navToRemoveEnd = 0;
        var ids = new Array();

        grunt.log.writeln('  ' + chalk.underline('Rendering markdown'));
        file = marked(file);
        grunt.log.writeln(chalk.green('✰ ') + chalk.yellow('Markdown converted to HTML'));

        //////////////////////////////
        // Parse out syntax highlighting
        //////////////////////////////
        grunt.log.writeln('  ' + chalk.underline('Updating markup code'));
        file = file.replace(/lang-html/g, "language-markup");
        file = file.replace(/lang-/g, "language-");
        file = file.replace(/<pre><code>/g, '<pre><code class="language-markup">');
        grunt.log.writeln(chalk.green('♻ ') + chalk.yellow('Code markup updated'));

        //////////////////////////////
        // Parse into sections
        //////////////////////////////
        matches = file.match(regex);
        for (var i in matches) {
          match = matches[i];
          // From http://stackoverflow.com/questions/3271061/regex-to-find-tag-id-and-content-javascript
          regex = new RegExp(/<([^\s]+).*?id="([^"]*?)".*?>(.+?)<\/\1>/gi);
          parts = regex.exec(match);

          link = '<a href="#' + parts[2] + '" class="deep-link">';

          if (parts[1] === 'h1') {
            if (sectionCount > 0) {
              replace = '</section>\n';
            }
            else {
              replace = '';
            }

            if (i > 0 && !isNav) {
              replace += '</article>\n';
              currentArticle = '';
            }
            else if (isNav) {
              replace += '</' + navToRemove + '>\n';
              isNav = false;
            }
            else {
              replace += '';
            }

            if (parts[3].toLowerCase() !== toc.toLowerCase()) {
              replace += '<article id="' + parts[2] + '" class="__main--article base--STYLED">\n';
              // console.log(chalk.cyan(articleCount) + ' ' + parts[2] + chalk.grey(' (article)'));
              currentArticle = parts[2];
              builtNav['items'][currentArticle] = {};
              builtNav['items'][currentArticle].name = parts[3];
              builtNav['items'][currentArticle].sections = [];
              articleCount++;
            }
            else {
              replace += '<' + navToRemove + '>\n';
              isNav = true;
              builtNav['id'] = parts[2];
              builtNav['name'] = parts[3];
              ids.push(parts[2]);
            }

            if (i > 0) {
              replace += '<h1>' + link + parts[3] + '</a></h1>';
            }
            sectionCount = 0;
            file = file.replace(parts[0], replace);
          }
          else if (parts[1] === 'h2') {
            if (sectionCount > 0) {
              replace = '</section>\n';
              subCount = 0;
            }
            else {
              replace = '';
            }
            replace += '<section id="' + parts[2] + '" class="__main--section">\n';
            replace += '<' + parts[1] + '>' + link + parts[3] + '</a></' + parts[1] + '>';
            // console.log('  ' + chalk.cyan(sectionCount) + ' ' + parts[2] + chalk.grey(' (section)'));
            currentSection = parts[2];
            builtNav['items'][currentArticle].sections[currentSection] = {};
            builtNav['items'][currentArticle].sections[currentSection].name = parts[3];
            builtNav['items'][currentArticle].sections[currentSection].sections = [];
            ids.push(parts[2]);
            // builtNav['items'][currentArticle].section[currentSection] = new Array();
            sectionCount++;
            file = file.replace(parts[0], replace);
          }
          else {
            if (parts[2]) {
              ids.push(parts[2]);
              replace = '<' + parts[1] + ' id="' + parts[2] + '">' + link + parts[3] + '</a></' + parts[1] + '>';
              // grunt.log.writeln(chalk.yellow(parts[0]) + chalk.white(' ➔ ') + chalk.yellow(replace));

              file = file.replace(parts[0], replace);
            //   // console.log(parts[2]);
            //   builtNav['items'][currentArticle].sections[currentSection].sections[parts[2]] = {};
            //   builtNav['items'][currentArticle].sections[currentSection].sections[parts[2]].name = parts[3];
            //   // console.log('    ' + chalk.cyan(subCount) + ' ' + parts[2] + chalk.grey(' (sub)'));
            //   subCount++;
            }
            // builtNav['items'][articleCount][sectionCount].push(part[2]);
          }
        }

        file += '\n</section></article>';

        //////////////////////////////
        // Build Navigation
        //////////////////////////////
        navHolder = builtNav['items'];

        navOutput = '<nav id="' + builtNav['id'] + '" class="nav" role="navigation">\n<ol role="menu">';
        for (var i in navHolder) {
          var sections = navHolder[i].sections;

          if (Object.keys(sections).length > 0) {
            navOutput += '<li class="nav--primary-item" role="menuitem" aria-haspopup="true"><a href="#' + i + '" class="nav--link">' + navHolder[i].name + '</a>';
            navOutput += '<ul class="nav--sub-sections" role="menu">';
            for (var j in sections) {
              navOutput += '<li class="nav--secondary-item" role="menuitem"><a href="#' + j + '" class="nav--link">' + sections[j].name + '</a>';
              var subsections = sections[j].sections;

              if (Object.keys(subsections).length > 0) {
                navOutput += '<ul class="nav--sub-sections" role="menu">';
                for (var k in subsections) {
                  navOutput += '<li class="nav--tertiary-item" role="menuitem"><a href="#' + k + '" class="nav--link">' + subsections[k].name + '</a></li>';
                }
                navOutput += '</ul>';
              }
              navOutput += '</li>'
            }
            navOutput += '</ul>';
          }
          else {
            navOutput += '<li class="nav--primary-item" role="menuitem"><a href="#' + i + '" class="nav--link">' + navHolder[i].name + '</a>';
          }
          navOutput += '</li>';
        }
        navOutput += '</ol></nav>';


        //////////////////////////////
        // Remove old navigation
        //////////////////////////////
        grunt.log.writeln('  ' + chalk.underline('Replacing main navigation'));

        navToRemoveStart = file.indexOf('<' + navToRemove + '>');
        navToRemoveEnd = file.indexOf('</' + navToRemove + '>') + navToRemove.length + 3;
        file = file.slice(0, navToRemoveStart) + file.slice(navToRemoveEnd);

        grunt.log.writeln(chalk.green('♻ ') + chalk.yellow('Navigation updated'));

        //////////////////////////////
        // Update internal links
        //////////////////////////////
        // console.log(ids);
        regex = new RegExp(/href="#([^"]*?)"(\sclass="deep-link")?/gi);
        matches = file.match(regex);

        grunt.log.writeln('  ' + chalk.underline('Updating internal links'));

        for (var i in matches) {
          match = matches[i];
          regex = new RegExp(/href="#([^"]*?)"(\sclass="deep-link")?/gi);
          parts = regex.exec(match);

          if (parts[2] === undefined) {
            for (var j in ids) {
              var distance = _s.levenshtein(ids[j], parts[1]);
              if (distance < 3 && distance > 0) {
                replaceRegex = new RegExp(parts[0], 'gi');
                file = file.replace(replaceRegex, 'href="#' + ids[j] + '"');
                grunt.log.writeln(chalk.green('♻ ') + chalk.yellow(parts[1]) + chalk.white(' ➔ ') + chalk.yellow(ids[j]) + chalk.gray(' (original ➔ current, ' + distance + ')'));
              }
            }
          }
        }

        //////////////////////////////
        // Put content into place
        //////////////////////////////
        grunt.log.writeln('  ' + chalk.underline('Writing file content'));
        template = template.replace("{{lang}}", lang);
        template = template.replace("{{dir}}", dir);
        template = template.replace("{{content}}", file);
        template = template.replace("{{nav}}", navOutput);
        template = template.replace("{{version}}", bowerJSON.devDependencies.north);
        grunt.file.write('./build/' + filename + '.html', template);

        grunt.log.writeln('Converted ' + chalk.cyan(doc) + ' to ' + chalk.cyan(filename + '.html'));
      });
    });

    //////////////////////////////
    // Server Task
    //////////////////////////////
    grunt.registerTask('serve', 'Development server', function() {
      grunt.task.run(['connect']);
      if (grunt.option('build')) {
        grunt.task.run(['build-html', 'build-images']);
      }
      if (grunt.option('launch')) {
        grunt.task.run(['open:dev']);
      }
      grunt.task.run(['parallel:dev']);
    });

    //////////////////////////////
    // Image Replace
    //////////////////////////////
    grunt.registerTask('replace-images', function() {
      _.forEach(buildHTML, function(filePath) {
        var file = grunt.file.read(filePath);
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
              replaceWith += ' style="width: 100%; height: auto"';
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

        grunt.file.write(filePath, file);
        grunt.log.writeln('Updated ' + chalk.cyan(filePath));
      });
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
    // Set up inline assets
    //////////////////////////////
    grunt.registerTask('inline-setup', function() {
      var file = '';
      var matches, match, parts, replace = '';
      var regex = new RegExp(/<([^\s]+).*?href="([^"]*?)".*?\/>/gi);

      for (var i in outputHTML) {
        file = grunt.file.read(outputHTML[i]);

        // Inline CSS
        regex = new RegExp(/<link rel="stylesheet" href="([^"]*?)".*?(\/)?>/gi);
        matches = file.match(regex);
        for (var j in matches) {
          match = matches[j];
          // From http://stackoverflow.com/questions/3271061/regex-to-find-tag-id-and-content-javascript
          regex = new RegExp(/<link rel="stylesheet" href="([^"]*?)".*?(\/)?>/gi);
          parts = regex.exec(match);
          // console.log(parts);
          replace = parts[1] + '?__inline=true';
          replace = parts[0].replace(parts[1], replace);
          file = file.replace(parts[0], replace);
        }

        // Inline JS
        regex = new RegExp(/<([^\s]+).*?src="([^"]*?)".*?>/gi);
        matches = file.match(regex);
        for (var j in matches) {
          match = matches[j];
          // From http://stackoverflow.com/questions/3271061/regex-to-find-tag-id-and-content-javascript
          regex = new RegExp(/<([^\s]+).*?src="([^"]*?)".*?>/gi);
          parts = regex.exec(match);
          if (parts[1] === 'script') {
            replace = parts[2] + '?__inline=true';
            replace = parts[0].replace(parts[2], replace);
            file = file.replace(parts[0], replace);
          }
        }

        // Write File
        grunt.file.write(outputHTML[i], file);
      }
    });

    //////////////////////////////
    // Build Minified Source
    //////////////////////////////
    grunt.registerTask('build-min', 'dom_munger:find_links useminPrepare concat cssmin uglify copy:usemin usemin uglify:deploy');

    //////////////////////////////
    // Build Responsive Images
    //////////////////////////////
    grunt.registerTask('build-images', 'clean:build_images dom_munger:find_links curl-dir responsive_images:build copy:build parallel:images image-copy:dom_munger.data.images replace-images:dom_munger.data.images');

    //////////////////////////////
    // Refresh Task
    //////////////////////////////
    grunt.registerTask('refresh', 'build-html build-images');

    grunt.registerTask('test', '');

    //////////////////////////////
    // Build Task
    //////////////////////////////
    grunt.registerTask('deploy', function() {

      grunt.task.run('clean:deploy_images', 'clean:deploy_html', 'copy:deployImages', 'compass:dist', 'build-min', 'inline-setup', 'inline:dist', 'clean:deploy_assets');

    });
  };
}());