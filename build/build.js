"use strict";

const es6transpiler = require('es6-transpiler')
	, path = require('path')
	, fs = require('fs')
	, _package = require('../package.json')
	, BUILD_VERSION = _package.version
	, targetDir = path.join(__dirname, 'es5')
	, srcDir = path.join(__dirname, '..', 'src')
	, projectDit = path.join(__dirname, '..')
;

// for build.js in prepare mode
const NODE_MODULES_ROOT = path.basename(path.join(__dirname, '..', '..')) === "npm" ? path.join(__dirname, '..', '..', '..') : "";

console.log('Beginning ' + _package.name + '(version ' + BUILD_VERSION + ') build');

let depsMap = {};

function prepareFile(files, fileOrDir, fullPath) {
	let extname = path.extname(fileOrDir);
	let fileName = fullPath === true ? fileOrDir : path.join(srcDir, fileOrDir);
	let outputFileName = fullPath === true ? path.join(targetDir, path.relative(srcDir, fileOrDir)) : path.join(targetDir, fileOrDir);
	let isFile = false;

	if ( fs.existsSync(extname ? fileName : fileName + ".js") ) {
		fileName = extname ? fileName : fileName + ".js";
		outputFileName = extname ? outputFileName : outputFileName + ".js";
		isFile = true;
		extname = path.extname(fileName);
	}

	if ( isFile ) {
		if ( extname === '.js' ) {
			files.push({src: fileName, dest: outputFileName});
		}
	}
	else if ( fs.existsSync(fileName) ) {
		if ( !fs.existsSync(outputFileName) ) {
//		    console.log('make a', outputFileName)
		    fs.mkdirSync(outputFileName);
		}

		let stat = fs.statSync(fileName);
		if ( stat && stat.isDirectory() ) {
			fs.readdirSync(fileName).forEach(function(file) {
				prepareFile(files, path.join(fileName, file), true);
			});
		}
	}

	return files;
}

[
	'StringAlter'
].reduce(prepareFile, []).forEach(function(file) {
	let srcFilename = file.src;
	let outputFilename = file.dest;

	console.log('compile ' + path.relative(projectDit, srcFilename) + ' to ' + path.relative(projectDit, outputFilename));

	let fileContent = String(fs.readFileSync(srcFilename)).replace("%%BUILD_VERSION%%", BUILD_VERSION);

	fileContent = inlineDeps(fileContent, path.dirname(srcFilename), ['\\.\\/.*?']);

	let res = es6transpiler.run({src: fileContent});

	if ( res.errors && res.errors.length ) {
		console.error.apply(console.error, ['ERRORS in file "' + path.relative(projectDit, srcFilename) + '":: \n   '].concat(res.errors, ['\n']));
		return;
	}

	fileContent = res.src;
	fileContent = inlineDeps(fileContent, path.dirname(srcFilename), ['[^\\s.\\\\]*?']);

	fs.writeFileSync(outputFilename, fileContent);
});

console.log("done build");

function loadNodeModuleContent(dep) {
	let content = null;
	const nodeModulesDir = path.join(NODE_MODULES_ROOT, '../node_modules/');

	fs.readdirSync(nodeModulesDir).some(function(folder) {
		if ( folder.charAt(0) === '.' )return false;

		folder = path.join(nodeModulesDir, folder);

		if ( fs.statSync(folder).isDirectory() ) {
			let _package = require(path.join(folder, 'package.json'));

			if ( _package["name"] == dep ) {
				let main = _package["main"];

				if ( main ) {
					main = path.join(folder, main);

					if ( fs.existsSync(main) ) {
						content = "var module = {exports: {}};" + String(fs.readFileSync(main)) + ";return module.exports";
					}
				}

				return true;
			}
		}
	});

	return content;
}

function loadFileContent(dep, basePath) {
	return "var module = {exports: {}};" + String(fs.readFileSync(path.join(basePath, dep))) + "\n;return module.exports";
}

function loadDepContent(dep, basePath) {
	if ( depsMap[dep] !== void 0 )return depsMap[dep];

	const isNodeModule = dep[0] !== '.' && dep[0] !== '//' && /^\w/.test(dep);

	return depsMap[dep] = isNodeModule ? loadNodeModuleContent(dep) : loadFileContent(dep, basePath);
}

function inlineDeps(content, basePath, depsForFind) {
	depsForFind.forEach(function(dep) {
		const re = new RegExp('require\\([\'"](' + dep + ')[\'"]\\)', 'g');
		let i = 0, uid = "_" + (Math.random() * 1e9 | 0) + Date.now(), tail = "";

		content = content.replace(re, function(found, dep) {
			let content = loadDepContent(dep, basePath);

			if ( content ) {
				let funcName = uid + "_" + ++i + "_require_" + dep.replace(/[.\\\/\-=+*&^%#@!'"?`~()|\[\]{}]/g, "_");

				tail += ("\n;function " + funcName + "(){" + content + "};");

				content = funcName + "()";

				console.log(" injecting ", dep, '->', funcName);
			}

			return content ? content : found;
		});

		content = content + tail;
	});
	return content;
}
