var gulp = require('gulp'),
    coffeelint = require('gulp-coffeelint'),
    csslint = require('gulp-csslint'),
    batch = require('gulp-batch'),
    coffee = require('gulp-coffee'),
    file = require('gulp-file'),
    connect = require('gulp-connect'),
    gutil = require('gulp-util'),
    notify = require('gulp-notify'),
    path = require('path'),
    fs = require('fs'),
    project;

gulp.task('default', ['server', 'watch']);

gulp.task('watch', function() {
    gulp.watch('./dev/**/*.{coffee,nls,tmpl,html,jpg,gif,png,svg,js,tiff}', ['notify'], batch(function(events, done) {
            events.on('end', done);
        })).on('error', function(error) {
            // silently catch 'ENOENT' error typically caused by renaming watched folders
            if (error.code === 'ENOENT') {
                return;
            }
        }); 

    gulp.watch('./dev/**/*.css', ['css'])
        .on('error', function(error) {
            // silently catch 'ENOENT' error typically caused by renaming watched folders
            if (error.code === 'ENOENT') {
                return;
            }
        });    
});

gulp.task('server', function() {
    project = path.resolve('.').split('/').slice(-1)[0];
    var port = 3000;

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

gulp.task('notify', ['build-dev'], function() {
    return gulp.src('./build/www-unoptimized/cordova.js')
      .pipe(notify('Build done: ' + project))
      .pipe(connect.reload());
});

gulp.task('build-dev', ['build-coffee', 'copy-nls', 'copy-templates', 'copy-assets', 'create-cordova']);

gulp.task('lint', ['coffeelint', 'csslint']);

gulp.task('css', function() {
    return gulp.src('./dev/www/**/*.css')
        .pipe(gulp.dest('./build/www-unoptimized/'));
});

gulp.task('build-coffee', function() {
    return gulp.src('./dev/coffeescript/**')
        .pipe(coffee({bare:true})
        .on('error', gutil.log))
        .pipe(gulp.dest('./build/www-unoptimized/js/'));
});

gulp.task('copy-nls', function() {
    return gulp.src('./dev/nls/**')
        .pipe(gulp.dest('./build/www-unoptimized/nls/'));
});

gulp.task('copy-templates', function() {
    return gulp.src('./dev/templates/**')
        .pipe(gulp.dest('./build/www-unoptimized/templates/'));
});

gulp.task('copy-assets', function() {
    return gulp.src('./dev/www/**')
        .pipe(gulp.dest('./build/www-unoptimized/'));
});

gulp.task('create-cordova', function() {
    return file('cordova.js', "{}", {src: true})
        .pipe(gulp.dest('./build/www-unoptimized/'));
});

gulp.task('coffeelint', function() {
    return gulp.src('./dev/coffeescript/**/*.coffee')
        .pipe(coffeelint('coffeelint.json'))
        .pipe(coffeelint.reporter());
});

gulp.task('csslint', function() {
    return gulp.src('./dev/www/css/{page,common}/**/*.css')
        .pipe(csslint({
            "bulletproof-font-face": false,
            "import": false,
            "known-properties": false
        }))
        .pipe(csslint.reporter());
});
