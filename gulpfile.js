const gulp         = require('gulp'),
      autoprefixer = require('gulp-autoprefixer'),
      browser_sync = require('browser-sync'),
      concat       = require('gulp-concat'),
      cp           = require('child_process'),
      sass         = require('gulp-sass');

const config = {
  npm_dir: './node_modules'
}

const jekyll = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
  jekyll_build: '<span style="color: grey;">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
  browser_sync.notify(messages.jekyll_build);
  return cp.spawn(jekyll, ['build'], {stdio: 'inherit'})
           .on('close', done);
});

/**
 * Rebuild Jekyll Site & do Page Reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], () => {
  browser_sync.reload();
});

/**
 * Wait for Jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'scripts', 'images', 'downloads', 'jekyll-build'], () => {
  browser_sync({
      server: {
          baseDir: '_site'
      }
  });
});

/**
 * Compile Stylesheets into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', () => {
  return gulp.src('./_assets/sass/*.scss')
             .pipe(sass({
               style: 'expanded',
               onError: browser_sync.notify
             }))
             .pipe(autoprefixer(
               ['last 15 versions', '> 1%', 'ie 8', 'ie 7'],
               {cascade: true}
             ))
             .pipe(gulp.dest('./_site/assets/css'))
             .pipe(browser_sync.reload({stream: true}))
             .pipe(gulp.dest('./assets/css'));
});

/**
 * Concatenate JS files
 */
gulp.task('scripts', () => {
  return gulp.src([
               config.npm_dir + '/jquery/dist/jquery.min.js',
               config.npm_dir + '/popper.js/dist/umd/popper.min.js',
               config.npm_dir + '/bootstrap/dist/js/bootstrap.min.js',
               './_assets/js/vendor/*.js',
               './_assets/js/*.js'
             ])
             .pipe(concat('scripts.js'))
             .pipe(gulp.dest('./_site/assets/js'))
             .pipe(browser_sync.stream())
             .pipe(gulp.dest('./assets/js'));
});

/**
 * Move images
 */
gulp.task('images', () => {
  return gulp.src('./_assets/img/**/*')
             .pipe(gulp.dest('./_site/assets/img'))
             .pipe(browser_sync.stream())
             .pipe(gulp.dest('./assets/img'));
});

/**
 * Move downloads
 */
gulp.task('downloads', () => {
  return gulp.src('./_assets/downloads/**/*')
             .pipe(gulp.dest('./_site/assets/downloads'))
             .pipe(browser_sync.stream())
             .pipe(gulp.dest('./assets/downloads'));
});

/**
 * Watch SCSS files for changes and reload
 * Watch HTML/MD files, run jekyll & reload BrowserSync
 */
gulp.task('watch', () => {
  gulp.watch('./_assets/sass/*.scss', ['sass']);
  gulp.watch('./_assets/sass/**/*.scss', ['sass']);
  gulp.watch('./_assets/js/*.js', ['scripts']);
  gulp.watch('./_assets/js/**/*.js', ['scripts']);
  gulp.watch('./_assets/img/**/*', ['images']);
  gulp.watch('./_assets/downloads/**/*', ['downloads']);
  gulp.watch(['*.md', '*.html', '_layouts/*.html', '_posts/*', '_includes/*'], ['jekyll-rebuild']);
});

/**
 * Default task, running just 'gulp' will compile the SASS,
 * compile the Jekyll site, launch BrowserSync & watch files
 */
gulp.task('default', ['browser-sync', 'watch']);
