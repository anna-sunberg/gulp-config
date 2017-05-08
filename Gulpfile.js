var gulp = require('gulp'),
    coffeelint = require('gulp-coffeelint'),
    csslint = require('gulp-csslint'),
    batch = require('gulp-batch'),
    coffee = require('gulp-coffee'),
    file = require('gulp-file'),
    connect = require('gulp-connect'),
    notify = require('gulp-notify'),
    path = require('path'),
    fs = require('fs'),
    sass = require('gulp-sass'),
    sasslint = require('gulp-sass-lint'),
    plumber = require('gulp-plumber'),
    replace = require('gulp-replace'),
    sourcemaps = require('gulp-sourcemaps'),
    project,
    port = 3000,
    scssEnabled = false,
    cssExt;

try {
    var conf = require(__dirname + '/_gulp_conf.json');
    project = path.resolve('.').split('/').slice(-1)[0];
    port = (conf.ports || {})[project] || port;
    scssEnabled = conf.sass[project] || false;
} catch (err) {}

cssExt = scssEnabled ? 'scss' : 'css';

gulp.task('default', ['server', 'watch', 'notify']);

gulp.task('watch', function() {
    /* watch task for non-css files */
    gulp.watch('./dev/**/*.{coffee,json,tmpl,html,jpg,gif,png,svg,js,tiff}', ['notify'], batch(function(events, done) {
        events.on('end', done);
    })).on('error', function(error) {
        // silently catch 'ENOENT' error typically caused by renaming watched folders
        if (error.code === 'ENOENT') {
            return;
        }
    });

    /* SCSS/CSS task */
    gulp.watch('./dev/**/*.' + cssExt, ['notify-css'], batch(function(events, done) {
        events.on('end', done);
    })).on('error', function(error) {
        // silently catch 'ENOENT' error typically caused by renaming watched folders
        if (error.code === 'ENOENT') {
            return;
        }
    });

    /* SCSS needs a separate task for copying external css */
    if (scssEnabled) {
        gulp.watch('./dev/www/external_css/**/*.*', ['css-external'], batch(function(events, done) {
            events.on('end', done);
        })).on('error', function(error) {
            // silently catch 'ENOENT' error typically caused by renaming watched folders
            if (error.code === 'ENOENT') {
                return;
            }
        });
    }   
});

gulp.task('server', function() {
    connect.server({
        root: './build/www-unoptimized/',
        port: port,
        livereload: true
    });
});

gulp.task('server-opt', function() {
    connect.server({
        root: './build/www/',
        port: port,
        livereload: true
    });
});

gulp.task('server-dist', function() {
    connect.server({
        root: './dist',
        port: port,
        livereload: true
    });
});

gulp.task('server-root', function() {
    connect.server({
        root: '.',
        port: port,
        livereload: true
    });
});

gulp.task('notify', ['build-dev'], function() {
    return gulp.src('./build/www-unoptimized/cordova.js')
      .pipe(notify('Build done: ' + project))
      .pipe(connect.reload());
});

gulp.task('notify-css', [cssExt], function() {
    return gulp.src('./build/www-unoptimized/css/*.css')
      .pipe(notify('CSS updated: ' + project))
      .pipe(connect.reload());
});

tasks = ['build-coffee', 'copy-nls', 'copy-templates', 'copy-modules', 'copy-index', 'create-cordova'];
if (scssEnabled) {
    tasks.push('scss');
}

gulp.task('build-dev', tasks);

gulp.task('lint', ['coffeelint', 'csslint']);

gulp.task('css', function() {
    return gulp.src('./dev/www/**/*.css')
        .pipe(gulp.dest('./build/www-unoptimized/'));
});

gulp.task('css-external', function() {
    return gulp.src('./dev/www/external_css/**/*.*')
        .pipe(gulp.dest('./build/www-unoptimized/external_css/'))
        .pipe(connect.reload());
});

gulp.task('scss', function() {
    return gulp.src('./dev/scss/theme_support/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./build/www-unoptimized/css/'));
});

gulp.task('build-coffee', function() {
    return gulp.src('./dev/**/*.coffee', { base: 'dev/coffeescript' })
        .pipe(replace('${app.version}', '1.0'))
        .pipe(replace(', app.supportedApiVersions', ''))
        .pipe(sourcemaps.init())
        .pipe(plumber({errorHandler: notify.onError("Error")}))
            .pipe(coffee({bare:true})
            .on('error', printCoffeeError))
        .pipe(sourcemaps.write('.'))
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

gulp.task('copy-modules', function() {
    return gulp.src('./dev/modules/**')
        .pipe(gulp.dest('./build/www-unoptimized/modules/'));
});

gulp.task('copy-index', ['copy-assets'], function() {
    return gulp.src('./dev/www/index.html')
        .pipe(replace('_${project.version}', ''))
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

gulp.task('sasslint', function() {
    return gulp.src('./dev/scss/**/*.scss')
        .pipe(sasslint({
            "options": {
                "config-file": ".sass-lint.yml"
            }
        }))
        .pipe(sasslint.format())
        .pipe(sasslint.failOnError())
});

function printCoffeeError(err) {
    var error = err.name + ' ' + err.message + ' on line ' + err.location.first_line + ' in ' + err.filename;
    console.log('Coffee error:');
    console.log(error);
}
