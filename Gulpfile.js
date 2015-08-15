var gulp            = require('gulp');
var util            = require('gulp-util');
var del             = require('del');
var gulpif          = require('gulp-if');
var concat          = require('gulp-concat');
var filter          = require('gulp-filter');
var sass            = require('gulp-sass');
var prefixer        = require('gulp-autoprefixer');
var minifycss       = require('gulp-minify-css');
var uglify          = require('gulp-uglify');
var minifyhtml      = require('gulp-minify-html');

var mainBowerFiles  = require('main-bower-files');
var sourcemaps      = require('gulp-sourcemaps');
var paths           = require('./gulp-paths.json');

var browserSync     = require('browser-sync');

var config = {
    production: !!util.env.production,
    sourcemaps: !util.env.production
};

/**
 * Start BrowserSync HTTP server
 */
gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: paths.build
        }
    });
});

/**
 * BrowserSync Reload - reload all connected browsers
 */
gulp.task('bs-reload', function() {
    browserSync.reload();
});

/**
 * Copy 3rd party JS files
 * 
 * @return {Stream}
 */
gulp.task('vendor-js', function() {
    var mainFiles = mainBowerFiles().concat(paths.source.javascript.vendor);

    if (mainFiles.length < 1) {
        return;
    }
    
    var jsFilter = filterByExtension(['js']);

    return gulp.src(mainFiles)
        .pipe(jsFilter)
        .pipe(concat('vendor.js'))
        // .pipe(uglify())
        .pipe(gulp.dest(paths.destination.js))
        .pipe(jsFilter.restore());
});

/**
 * Copy 3rd party CSS files
 * 
 * @return {Stream}
 */
gulp.task('vendor-css', function() {
    var mainFiles = mainBowerFiles();
    
    if (mainFiles.length < 1) {
        return;
    }

    var cssFilter = filter(['*.css']);

    return gulp.src(mainFiles)
        .pipe(cssFilter)
        .pipe(concat('vendor.css'))
        // .pipe(prefixer())
        .pipe(minifycss())
        .pipe(gulp.dest(paths.destination.css))
        .pipe(cssFilter.restore());
});

/**
 * Copy font files from vendor/ and source/
 * 
 * @return {Stream}
 */
gulp.task('fonts', function() {
    var mainFiles = mainBowerFiles().concat(paths.source.fonts);
    var fontFilter = filterByExtension(['eot', 'ttf', 'woff', 'woff2', 'otf']);

    if (mainFiles.length < 1) {
        return;
    }

    return gulp.src(mainFiles)
        .pipe(fontFilter)
        .pipe(gulp.dest(paths.destination.fonts))
        .pipe(fontFilter.restore());
});

/**
 * Compile and bundle app CSS files
 * 
 * @return {Stream}
 */
gulp.task('css', function() {
    return gulp.src(paths.source.sass)
        .pipe( gulpif(config.sourcemaps, sourcemaps.init()) )
            .pipe(sass()).on('error', suppressErrors)
            .pipe( gulpif(config.production, prefixer()) )
            .pipe( gulpif(config.production, minifycss()) )
        .pipe( gulpif(config.sourcemaps, sourcemaps.write()) )
        .pipe(gulp.dest(paths.destination.css));
});

/**
 * Copy and bundle game javascript
 * 
 * @return {Stream}
 */
gulp.task('javascript', function() {
    return gulp.src(paths.source.javascript.game)
        .pipe( gulpif(config.sourcemaps, sourcemaps.init()) )
            .pipe(concat('game.js'))
            .pipe( gulpif(config.production, uglify()) )
        .pipe( gulpif(config.sourcemaps, sourcemaps.write()) )
        .pipe(gulp.dest(paths.destination.js));
});

/**
 * Copy app HTML files
 * 
 * @return {Stream}
 */
gulp.task('html', function() {
    return gulp.src(paths.source.html)
        .pipe( gulpif(config.production, minifyhtml({
                    spare: true,
                    empty: true
                }))
            )
        .pipe(gulp.dest(paths.destination.html));
});

/**
 * Copy image files
 * 
 * @return {Stream}
 */
gulp.task('images', function() {
    return gulp.src(paths.source.images)
        .pipe(gulp.dest(paths.destination.images));
});

/**
 * Watch source files to trigger build tasks
 */
gulp.task('watch', function() {
    gulp.watch(paths.watch.sass, ['css', 'bs-reload']);
    gulp.watch(paths.watch.javascript, ['javascript', 'bs-reload']);
    gulp.watch(paths.watch.images, ['images', 'bs-reload']);
    gulp.watch(paths.watch.fonts, ['fonts', 'bs-reload']);
    gulp.watch(paths.watch.html, ['html', 'bs-reload']);
});

/**
 * Default Gulp task
 */
gulp.task('default', [
    'images', 'css', 'fonts', 'html', 'javascript', 'browser-sync', 'watch'
]);

/**
 * Build without watching or starting the server
 */
gulp.task('build', [
    'build:full'
    // 'css', 'html', 'javascript', 'fonts'
]);

/**
 * Build without watching
 */
gulp.task('build:full', [
    'vendor-js', 'vendor-css', 'css', 'html', 'javascript', 'images', 'fonts'
]);

/**
 * Clean build directory
 */
gulp.task('clean', function(cb) {
    del(paths.build, cb);
});

/**
 * Return files matching a given extension
 * from an array
 * 
 * @param  {String} extension
 * @return {Array}
 */
function filterByExtension(extensions) {
    return filter(function(file) {
        for (var i = 0; i < extensions.length; i++) {
            if ( file.path.match(new RegExp('.' + extensions[i] + '$')) ) {
                return true;
            }
        }

        return false;
    });
}

/**
 * Log and supress errors occuring in the
 * Gulp stream
 * 
 * @param  {Error} error
 */
function suppressErrors(error) {
    console.log(error);
    this.emit('end');
}
