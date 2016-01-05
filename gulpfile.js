const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const postcss = require('gulp-postcss');
const notify = require('gulp-notify');
const watch = require('gulp-watch');
const debug = require('gulp-debug');
const inject = require('gulp-inject');
const tsc = require('gulp-typescript');
const tslint = require('gulp-tslint');
const del = require('del');
const Config = require('./gulpfile.config');
const browserSync = require('browser-sync');
const superstatic = require('superstatic');

var tsProject = tsc.createProject('tsd.json');
var config = new Config();

gulp.task('css', function() {
    var processors = [
        require('postcss-import')(),
        require('cssnext')(),
        require('postcss-responsive-images')(),
        require('autoprefixer')(),
        require('postcss-for'),
        require('postcss-mixins')(),
        require('postcss-simple-vars')(),
        require('postcss-conditionals'),
        require('postcss-nested'),
        require('postcss-color-function')(),
        require('css-mqpacker'),
        require('lost')(),
        require('rucksack-css')()
        //,require('cssnano')()
    ];
    return gulp.src('./styles/*.css')
        .pipe(postcss(processors))
        .pipe(gulp.dest('web/dist'))
        .pipe(notify('CSS is okay Calza!'));
});


gulp.task('ts-lint', function() {
    return gulp.src(config.allTypeScript).pipe(tslint()).pipe(tslint.report('prose'));
});


gulp.task('compile-ts', function() {
    var sourceTsFiles = [config.allTypeScript, //path to typescript files
        config.libraryTypeScriptDefinitions
    ]; //reference to library .d.ts files


    var tsResult = gulp.src(sourceTsFiles)
        .pipe(sourcemaps.init())
        .pipe(tsc(tsProject));

    tsResult.dts.pipe(gulp.dest(config.tsOutputPath));
    return tsResult.js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.tsOutputPath))
        .pipe(notify('JS is okay Calza!'));
});

/**
 * Remove all generated JavaScript files from TypeScript compilation.
 */
gulp.task('clean-ts', function(cb) {
    var typeScriptGenFiles = [
        config.tsOutputPath + '/**/*.js', // path to all JS files auto gen'd by editor
        config.tsOutputPath + '/**/*.js.map', // path to all sourcemap files auto gen'd by editor
        '!' + config.tsOutputPath + '/lib'
    ];

    // delete the files
    del(typeScriptGenFiles, cb);
});

gulp.task('watch', function() {
    gulp.watch([config.allTypeScript], ['ts-lint', 'compile-ts']);
    gulp.watch([config.allPostCSS], ['css']);
});

gulp.task('serve', ['compile-ts', 'watch'], function() {
    process.stdout.write('Starting browserSync and superstatic...\n');
    browserSync({
        port: 3000,
        files: ['index.html', '**/*.js', '**/*.css'],
        injectChanges: true,
        logFileChanges: false,
        logLevel: 'silent',
        logPrefix: 'websystem',
        notify: true,
        reloadDelay: 0,
        server: {
            baseDir: './web',
            middleware: superstatic({
                debug: false
            })
        }
    });
});

gulp.task('default', ['ts-lint', 'compile-ts', 'css']);
