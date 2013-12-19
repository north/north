(function() {
  'use strict';

  module.exports = function (grunt) {
    // Grunt task configuration
    grunt.initConfig({
      // Configuration goes in here
    });

    // Use matchdep to load all Grunt tasks from package.json
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // Custom Grunt tasks go here.
    // This is the special `default` task
    grunt.registerTask('default', function () {
      console.log('This runs when you run `grunt`');
    });
  };
}());