var gulp = require('gulp'),
  minifycss = require('gulp-minify-css'),
  jshint = require('gulp-jshint'),
  stylish = require('jshint-stylish'),
  uglify = require('gulp-uglify'),
  usemin = require('gulp-usemin'),
  imagemin = require('gulp-imagemin'),
  rename = require('gulp-rename'),
  concat = require('gulp-concat'),
  notify = require('gulp-notify'),
  cache = require('gulp-cache'),
  changed = require('gulp-changed'),
  rev = require('gulp-rev'),
  browserSync = require('browser-sync'),
  ngannotate = require('gulp-ng-annotate'),
  del = require('del');


gulp.task('jshint', function() {
  return gulp.src('./app/scripts/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

// Clean
gulp.task('clean', function() {
  return del(['dist']);
});

// Default task
gulp.task('default', ['clean'], function() {
  return gulp.start('usemin', 'imagemin', 'copyfonts');
});

gulp.task('usemin', ['jshint'], function() {
  return gulp.src('./app/**/*.html')
    .pipe(usemin({
      css: [minifycss()],
      js: [ngannotate()]
    }))
    .pipe(gulp.dest('dist/'));
});

gulp.task('clean-gh-pages', function() {
  return del(['./gh-pages/*']);
})
gulp.task('gh-pages', ['clean-gh-pages', 'clean', 'usemin', 'imagemin', 'copyfonts'], function() {
  return gulp.src('./dist/**/*').pipe(gulp.dest('./gh-pages/'));
})

// Images
gulp.task('imagemin', function() {
  return del(['dist/images']), gulp.src('app/images/**/*')
    .pipe(cache(imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe(notify({
      message: 'Images task complete'
    }));
});

gulp.task('copyfonts', ['clean'], function() {
  gulp.src('./bower_components/bootstrap/fonts/**/*.{ttf,woff,eof,svg}*')
    .pipe(gulp.dest('./dist/font'));
});

// Watch
gulp.task('watch', ['browser-sync'], function() {
  // Watch .js files
  gulp.watch('{app/**/*.js,app/**/*.css,app/**/*.html}', ['usemin']);
  // Watch image files
  gulp.watch('app/images/**/*', ['imagemin']);

});

gulp.task('browser-sync', ['default'], function() {
  var files = [
    'app/**/*.html',
    'app/**/*.js',
    'dist/**/*',
    'bower_components/**/*',
  ];

  browserSync.init(files, {
    server: {
      baseDir: "dist",
      index: "index.html"
    }
  });
  // Watch any files in dist/, reload on change
  gulp.watch(['dist/**']).on('change', browserSync.reload);
});
