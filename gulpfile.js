const gulp = require('gulp');
const { src, dest, watch, parallel, series } = require('gulp');
// const sassModule = require('gulp-sass');
const pugModule = require('gulp-pug');
const browserSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const flexbugFixes = require('postcss-flexbugs-fixes');
const rtlcssModule = require('rtlcss');
const renameModule = require('gulp-rename');
const cleanModule = require('gulp-clean');
const spritesmith = require('gulp.spritesmith');
const cssoModule = require('gulp-csso');
const babelModule = require('gulp-babel');
const concatModule = require('gulp-concat');
const uglifyModule = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const zipModule = require('gulp-zip');
const notifyModule = require("gulp-notify");

const tailwindcss = require('tailwindcss');


// sassModule.compiler = require('node-sass');

const sassModule = require('gulp-sass')(require('sass'));

var sassGlob = require('gulp-sass-glob');

const fs = require('fs');
const path = require('path');
const through = require('through2');

const createRelativePaths = (paths, replaceStr, replaceTarget) => {
	let obj = {};
	for (const property in paths) {
		obj[property] = paths[property].replace(replaceStr, replaceTarget);
	}
	return obj;
}

const disableArabic = false;

const utc = new Date().toJSON().slice(0, 10) + "_" +
	`${new Date().getHours().toString().padStart(2, 0)}-${new Date().getMinutes().toString().padStart(2, 0)}-${new Date().getSeconds().toString().padStart(2, 0)}`;

// var packageName = "package/package_" + utc;

const version = Math.floor((Math.random() * 1000) + 1);
const paths = {}
const dirName = {
	src: 'app',
	assets: 'assets',
	sass: 'sass',
	css: 'css',
	js: 'js',
	jquery: 'jquery',
	jsScripts: 'app',
	jsLibs: 'lib',
	build: 'build',
	images: 'images',
	videos: 'videos',
	spriteIcons: 'sprite-icons',
	views: 'views',
	imagesCompressed: 'compressed-images',
	en: 'en',
	ar: 'ar',
	dist: 'dist',
	package: 'package'
}

paths.app = `./${dirName.src}`;
paths.assets = `${paths.app}/${dirName.assets}`;
paths.sass = `${paths.assets}/${dirName.sass}`;
paths.css = `${paths.assets}/${dirName.css}`;
paths.js = `${paths.assets}/${dirName.js}`;
paths.jsJquery = `${paths.js}/${dirName.jquery}`;
paths.jsCore = `${paths.js}/${dirName.jsScripts}`;
paths.jsLibs = `${paths.js}/${dirName.jsLibs}`;
paths.jsOutput = `${paths.js}/${dirName.build}`;
paths.img = `${paths.assets}/${dirName.images}`;
paths.video = `${paths.assets}/${dirName.videos}`;
paths.spriteIcons = `${paths.img}/${dirName.spriteIcons}`;
paths.views = `${paths.app}/${dirName.views}`;
paths.imagesCompressed = `${dirName.imagesCompressed}`;
paths.en = `${paths.app}/${dirName.en}`;
paths.ar = `${paths.app}/${dirName.ar}`;
paths.server = `//192.168.1.201/Projects/dummypath`;

const relativePaths = createRelativePaths(paths, paths.app, '..');

const postcssPlugins = [
	flexbugFixes(),
	autoprefixer({ overrideBrowserslist: ['last 4 versions'] }),
	tailwindcss('./tailwind.config.js'),
]

const errorFunction = (error) => {
	return error.message;
}

/* Clean Tasks  */

const clean = {
	cleanHtml: function () {
		return src([paths.en, paths.ar], { allowEmpty: true }, { read: false })
			.pipe(cleanModule());
	},
	cleanCss: function () {
		return src(paths.css, { allowEmpty: true }, { read: false })
			.pipe(cleanModule());
	},
	cleanJs: function () {
		return src(paths.jsOutput, { allowEmpty: true }, { read: false })
			.pipe(cleanModule());
	},
	cleanDist: function () {
		return src(dirName.dist, { allowEmpty: true }, { read: false })
			.pipe(cleanModule());
	},
	cleanPackage: function () {
		return src(dirName.package, { allowEmpty: true }, { read: false })
			.pipe(cleanModule());
	}
}

/* Sprite PNGs */

function sprite() {
	var spriteData = src(`${paths.spriteIcons}/*.png`, { allowEmpty: true })
		.pipe(spritesmith({
			imgName: 'images/sprite.png',
			cssName: 'sass/sprites/sprite.css',
			imgPath: '../images/sprite.png'
		}).on('error', notifyModule.onError()));
	return spriteData.pipe(dest(paths.assets));
}

/* Pug Tasks */

function compilePug(prod, lang) {
	return src(`${paths.views}/*.pug`, { allowEmpty: true })
		.pipe(pugModule({
			data: {
				prod: prod,
				lang: lang,
				paths: relativePaths,
				version: version
			},
			pretty: true,
		})).on("error", notifyModule.onError(errorFunction))
		.pipe(dest(`${paths.app}/${lang}`))
		.pipe(browserSync.stream({ once: true }));
}

const pugDevEn = () => { return compilePug(false, 'en') }
const pugDevAr = (done) => { return disableArabic ? done() : compilePug(false, 'ar') }
const pugProdEn = () => { return compilePug(true, 'en') }
const pugProdAr = (done) => { return disableArabic ? done() : compilePug(true, 'ar') }

/* Sass / Css Tasks */

function sass() {
	return src(`${paths.sass}/*.scss`, { allowEmpty: true })
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(sassGlob())
		.pipe(sassModule().on('error', notifyModule.onError()))
		.pipe(postcss(postcssPlugins).on('error', notifyModule.onError()))
		.pipe(sourcemaps.write('.'))
		.pipe(dest(paths.css))
		.pipe(browserSync.stream({ once: true }))
}

function rtlcss(done) {
	if (disableArabic)
		done();
	else {
		return src(`${paths.css}/style.css`, { allowEmpty: true })
			.pipe(sourcemaps.init({ loadMaps: true }))
			.pipe(postcss([rtlcssModule]).on('error', notifyModule.onError()))
			.pipe(renameModule({ suffix: '-ar' }).on('error', notifyModule.onError()))
			.pipe(sourcemaps.write('.'))
			.pipe(dest(paths.css))
	}

}

function csso() {
	return src(`${paths.css}/**/*.css`, { allowEmpty: true })
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(cssoModule().on('error', notifyModule.onError()))
		.pipe(renameModule({ extname: '.min.css' }).on('error', notifyModule.onError()))
		.pipe(sourcemaps.write('.'))
		.pipe(dest(paths.css))

}

/* Javascript Tasks */

const renameRemoveBabel = (path) => {
	return {
		dirname: path.dirname,
		extname: path.extname,
		basename: path.basename.replace('.babel', '')
	};
}

function jsBabel() {
	return src(`${paths.jsCore}/*.js`, { allowEmpty: true })
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(babelModule({
			presets: ['@babel/env']
		}).on('error', notifyModule.onError()))
		.pipe(renameModule(renameRemoveBabel).on('error', notifyModule.onError()))
		.pipe(sourcemaps.write('.'))
		.pipe(dest(paths.jsOutput))
		.pipe(browserSync.stream({ once: true }))
}

function jsConcat() {
	return src([`${paths.jsJquery}/*.js`, `${paths.jsLibs}/*.js`, `${paths.jsOutput}/*.js`, `!${paths.jsOutput}/app.js`, `!${paths.jsOutput}/app.min.js`], { allowEmpty: true })
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(concatModule('app.js').on('error', notifyModule.onError()))
		.pipe(sourcemaps.write('.'))
		.pipe(dest(paths.jsOutput))
	//	.pipe(browserSync.stream())
}

function jsMinify() {
	return src(`${paths.jsOutput}/app.js`, { allowEmpty: true })
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(uglifyModule().on('error', notifyModule.onError()))
		.pipe(renameModule({ extname: '.min.js' }).on('error', notifyModule.onError()))
		.pipe(sourcemaps.write('.'))
		.pipe(dest(paths.jsOutput))
	//	.pipe(browserSync.stream())
}



/* Watch Tasks */

const watchSass = function () {
	watch(`${paths.sass}/**/*.scss`, sassDev)
};
const watchPug = function () {
	// watch(`${paths.views}/**/*.pug`, [pugDev, sassDev]); old version before 4
	watch(`${paths.views}/**/*.pug`, gulp.series(pugDev, sassDev));
};
const watchJs = function () {
	watch(`${paths.jsCore}/*.js`, jsDev);
};

const watchSprites = function () {
	watch(`${paths.spriteIcons}/*.png`, series(sprite, sassDev));
};

const watchSassProd = function () {
	watch(`${paths.sass}/**/*.scss`, sassProd)
};
const watchPugProd = function () {
	watch(`${paths.views}/**/*.pug`, pugProd);
};
const watchJsProd = function () {
	watch(`${paths.jsCore}/*.js`, jsProd);
};

/* Image Optimization */

function imageMinification() {
	return src(`${paths.img}/*`, { allowEmpty: true })
		.pipe(imagemin().on('error', notifyModule.onError()))
		.pipe(dest(paths.imagesCompressed))
}

/* Distribution */

function dist() {
	return src([paths.en, paths.ar, `${paths.app}/**/*`, `!${paths.assets}/{${dirName.sass},${dirName.sass}/**}`, `!${paths.js}/{${dirName.jsScripts},${dirName.jsScripts}/**}`, `!${paths.app}/{${dirName.views},${dirName.views}/**}`], { allowEmpty: true })
		.pipe(dest(dirName.dist));
}

/* Package */

function packageTask() {
	return src(`${dirName.dist}/**/*`, { allowEmpty: true })
		.pipe(zipModule(`${dirName.package}_${utc}.zip`).on('error', notifyModule.onError()))
		.pipe(dest(dirName.package))
}

function packageServer() {
	return src(`${dirName.dist}/**/*`, { allowEmpty: true })
		.pipe(zipModule(`${dirName.package}_${utc}.zip`).on('error', notifyModule.onError()))
		.pipe(dest(paths.server))
}

/* Server */

function server() {
	browserSync.init(null, {
		// tunnel: true,
		// notify: false
		server: {
			baseDir: paths.app,
			directory: true
		},
		startPath: `${dirName.en}/index.html`
	});
}

function generateFileList(outputPath = 'app/en/index.html') {
	return function () {
		return src(['app/en/*.html'], { allowEmpty: true })
			.pipe(through.obj(function (file, enc, cb) {
				this.files = this.files || [];
				this.files.push(path.basename(file.path));
				cb();
			}, function (cb) {
				const listItems = this.files.map(f => `<li><a href="/en/${f}">${f}</a></li>`).join('\n');

				const css = `
						<style>
						* { margin: 0; padding: 0; outline: 0; }
						body {
							padding: 80px 100px;
							font: 13px "Helvetica Neue", "Lucida Grande", "Arial";
							background: #ECE9E9 -webkit-gradient(linear, 0% 0%, 0% 100%, from(#fff), to(#ECE9E9));
							background: #ECE9E9 -moz-linear-gradient(top, #fff, #ECE9E9);
							background-repeat: no-repeat;
							color: #555;
							-webkit-font-smoothing: antialiased;
						}
						h1, h2, h3 { font-size: 22px; color: #343434; }
						h1 em, h2 em { padding: 0 5px; font-weight: normal; }
						h1 { font-size: 60px; }
						h2 { margin-top: 10px; }
						h3 { margin: 5px 0 10px 0; padding-bottom: 5px; border-bottom: 1px solid #eee; font-size: 18px; }
						ul li { list-style: none; }
						ul li:hover { cursor: pointer; color: #2e2e2e; }
						ul li .path { padding-left: 5px; font-weight: bold; }
						ul li .line { padding-right: 5px; font-style: italic; }
						ul li:first-child .path { padding-left: 0; }
						p { line-height: 1.5; }
						a { color: #555; text-decoration: none; }
						a:hover { color: #303030; }
						#stacktrace { margin-top: 15px; }
						.directory h1 { margin-bottom: 15px; font-size: 18px; }
						ul#files { width: 100%; height: 100%; overflow: hidden; }
						ul#files li { float: left; width: 30%; line-height: 25px; margin: 1px; }
						ul#files li a {
							display: block; height: 25px; border: 1px solid transparent;
							border-radius: 5px; overflow: hidden; white-space: nowrap;
						}
						ul#files li a:focus,
						ul#files li a:hover {
							background: rgba(255,255,255,0.65);
							border: 1px solid #ececec;
						}
						ul#files li a.highlight {
							transition: background .4s ease-in-out;
							background: #ffff4f; border-color: #E9DC51;
						}
						</style>`;

				const html = `
						<!DOCTYPE html>
						<html>
						<head>
						<meta charset="UTF-8">
						<title>File List</title>
						${css}
						</head>
						<body>
						<ul id="files">${listItems}</ul>
						</body>
						</html>`;

				fs.writeFileSync(outputPath, html);
				console.log("🚀 ~ html:", html);
				cb();
			}));
	};
}


// private tasks
// const pugDev = parallel(pugDevEn); // disable ar to decrease processing time
const pugDev = parallel(pugDevEn, pugDevAr);
const pugProd = parallel(pugProdEn, pugProdAr);
const jsDev = series(jsBabel);
const jsProd = series(jsBabel, jsConcat, jsMinify);
const sassDev = series(sass, rtlcss);
const sassProd = series(sass, rtlcss, csso);
const jsIndex = series(generateFileList);

// public tasks
exports.imageMinification = imageMinification;
exports.cleanAll = parallel(clean.cleanHtml, clean.cleanCss, clean.cleanJs, clean.cleanDist, clean.cleanPackage);
exports.watchAll = parallel(watchPug, watchSass, watchJs, watchSprites);
exports.runDev = series(parallel(exports.cleanAll, sprite), parallel(pugDev, sassDev, jsDev));
exports.runProd = series(parallel(exports.cleanAll, sprite), parallel(pugProd, sassProd, jsProd));
exports.startDev = series(exports.runDev, generateFileList(), parallel(server, exports.watchAll));
exports.packageDev = series(exports.runDev, dist, packageTask, clean.cleanDist);
exports.packageProd = series(exports.runProd, dist, packageTask, clean.cleanDist);
exports.packageToServer = series(exports.runProd, dist, packageServer, clean.cleanDist);
exports.default = exports.startDev;
exports.generateIndex = generateFileList();