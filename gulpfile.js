var 
  gulp = require('gulp'),
  sass = require('gulp-sass'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  config = require('./package.json').config,
  postcss = require('gulp-postcss'),
  rename = require('gulp-rename'),
  del = require('del'),
  imagemin = require('gulp-imagemin'),
  cache = require('gulp-cache'),
  autoprefixer = require('autoprefixer'),
  csso = require('postcss-csso'),
  browserSync = require('browser-sync').create();

gulp.task('common-js', function() {
  return gulp.src([
    config.src.js + '/common.js',
  ])
    .pipe(concat('common.min.js'))
    // .pipe(uglify()) // minimize common js
    .pipe(gulp.dest(config.src.js));
});

gulp.task('js', ['common-js'], function() {
  return gulp.src([
    'src/libs/jquery/dist/jquery.min.js',
    'src/js/common.min.js', // always in the end of the list
  ])
    .pipe(concat('scripts.min.js'))
    // .pipe(uglify()) // minimize all js
    .pipe(gulp.dest(config.src.js))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('server', function() {
  browserSync.init({
    server: {
      baseDir: 'src'
    },
    // tunnel: true,
    // tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
  });
});

var processors = [
  autoprefixer({
    browsers: ['last 4 versions'],
  }),
  // csso 
  // csso is optional, uncomment before build
];
 
gulp.task('sass', function() {
  return gulp
    .src(config.src.sass + '/*.sass')
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError)) // nested, expanded, compact, compressed
    .pipe(rename({suffix: '.min', prefix : ''}))
    .pipe(postcss(processors))
    .pipe(gulp.dest(config.src.css))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('watch', ['sass', 'js', 'server'], function() {
  gulp.watch(config.src.sass + '/**/*.sass', ['sass']);
  gulp.watch([config.src.libs + '/**/*.js', config.src.js + '/common.js'], ['js']);
  gulp.watch(config.src.html + '/*.html', browserSync.reload);
});

gulp.task('imagemin', function() {
  return gulp.src(config.src.img + '/**/*')
    .pipe(cache(imagemin())) // Cache Images
    .pipe(gulp.dest(config.build.img));
});

gulp.task('build', ['removedist', 'imagemin', 'sass', 'js'], function() {

  var buildFiles = gulp.src([
    config.src.html + '/*.html',
    'src/.htaccess',
  ]).pipe(gulp.dest('build'));

  var buildCss = gulp.src([
    config.src.css + '/*.min.css',
  ]).pipe(gulp.dest(config.build.css));

  var buildJs = gulp.src([
    config.src.js + '/scripts.min.js',
  ]).pipe(gulp.dest(config.build.js));

  var buildFonts = gulp.src([
    config.src.fonts + '/**/*',
  ]).pipe(gulp.dest(config.build.fonts));

});

gulp.task('removedist', function() { 
  return del.sync('build'); 
});

gulp.task('clearcache', function() { 
  return cache.clearAll(); 
});

gulp.task('default', ['watch']);
