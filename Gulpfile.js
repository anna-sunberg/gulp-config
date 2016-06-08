var gulp = require('gulp'),
    coffeelint = require('gulp-coffeelint'),
    watch = require('gulp-watch'),
    batch = require('gulp-batch'),
    coffee = require('gulp-coffee'),
    file = require('gulp-file'),
    gls = require('gulp-live-server'),
    connect = require('gulp-connect'),
    path = require("path"),
    fs = require('fs');

gulp.task('default', ['server', 'watch']);

gulp.task('watch', function() {
    watch(['dev/**/*.{coffee,js,png,gif,svg,html,tmpl,json,ttf}'], batch(function(events, done) {
        gulp.start('build-dev', done);
    }));

    watch('dev/**/*.css', batch(function(events, done) {
        gulp.start('css', done);
    }));
});

gulp.task('server', function() {
    var project = path.resolve('.').split('/').slice(-1)[0],
        port = 3000;

    try {
        var conf = require(__dirname + '/gulp_conf.json');
        port = conf.ports[project] || port;
    } catch (err) {}

    connect.server({
        root: './build/www-unoptimized/',
        port: port,
        livereload: true
    });
});

gulp.task('css', function() {
    gulp.src('./dev/www/**/*.css')
        .pipe(gulp.dest('./build/www-unoptimized/'))
        .pipe(connect.reload());
});

gulp.task('build-dev', function() {
        gulp.src('./dev/coffeescript/**/*.coffee')
            .pipe(coffee({bare:true}).on('error', console.log))
            .pipe(gulp.dest('./build/www-unoptimized/js/'));

        gulp.src('./dev/nls/**')
            .pipe(gulp.dest('./build/www-unoptimized/nls/'));

        gulp.src('./dev/templates/**')
            .pipe(gulp.dest('./build/www-unoptimized/templates/'));

        gulp.src('./dev/www/**')
            .pipe(gulp.dest('./build/www-unoptimized/'));

        file('cordova.js', Math.random(), {src: true})
            .pipe(gulp.dest('./build/www-unoptimized/'))
            .pipe(connect.reload());
});