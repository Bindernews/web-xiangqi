
var gulp = require('gulp'),
    ts = require('gulp-typescript'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    clean = require('gulp-clean'),
    merge = require('gulp-merge'),
    concat = require('gulp-concat');

gulp.task('clean', function() {
    return gulp.src(['build/*.js', 'build/*.html', 'build/*.css'], {read: false})
        .pipe(clean());
});


gulp.task('typescript', ['clean'], function() {
    return gulp.src('src/*.ts')
        .pipe(sourcemaps.init())
        .pipe(ts({
            target: 'ES5',
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('build/'));
});

gulp.task('static-copy', ['clean'], function() {
    return gulp.src('static/*.*')
        .pipe(gulp.dest('build/'))
});

gulp.task('client', ['clean', 'typescript'], function() {
    return gulp.src(['build/client_common.js', 'build/model.js'])
        .pipe(sourcemaps.init())
        .pipe(concat('client.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('build/'));
});

gulp.task('client-dist', ['clean', 'typescript'], function() {
    return gulp.src(['build/client_common.js', 'build/model.js'])
        .pipe(concat('client.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('build/'));
});

gulp.task('dist', ['clean', 'static-copy', 'client-dist'], function() {});

gulp.task('build', ['clean', 'static-copy', 'client'], function() {});
