const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const postcss = require('gulp-postcss');
const notify = require('gulp-notify');
const watch = require('gulp-watch');

gulp.task('js', () => {
	return gulp.src('scripts/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(concat('all.js'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('web/dist'))
		.pipe(notify('JavaScript is okay Calza!'));
});


gulp.task('css', function () {
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
		.pipe(watch('./styles/*.css'))
        .pipe(postcss(processors))
        .pipe(gulp.dest('web/dist'))
		.pipe(notify('CSS is okay Calza!'));
});


gulp.task('default', ['css', 'js']);
