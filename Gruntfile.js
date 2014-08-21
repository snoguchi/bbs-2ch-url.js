module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({
    uglify: {
      dist: {
        files: {
          'bbs-2ch-url.min.js': 'bbs-2ch-url.js'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['uglify']);
};