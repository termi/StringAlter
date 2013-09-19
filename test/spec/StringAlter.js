//(alter = new StringAlter(string = "[ x1 ] <-> [ x2 ]"))
//	.insert(2, "|||")
//	.replace(2, 4, "{" + alter.get(13, 15) + "}")
//	.replace(13, 15, alter.get(2, 4))
//	.wrap(0, string.length, "<<", ">>")
//	.wrap(0, string.length, "((", "))")
//;
//alter.apply() === "((<<[ |||{x2} ] <-> [ x1 ]>>))";
//
//(alter = new StringAlter(string = "[ x1 ] <-> [ x2 ]"))
//	.insert(2, "|")
//	.replace(2, 4, "{" + alter.get(13, 15) + "}")
//	.insert(4, "|")
//	.replace(13, 15, alter.get(2, 4))
//	.wrap(0, string.length, "<<", ">>")
//	.wrap(0, string.length, "((", "))")
//;
//alter.apply() === "((<<[ |{x2}| ] <-> [ x1 ]>>))";
//
//(alter = new StringAlter(string = "[ x1 ] <-> [ x2 ]"))
//	.insert(3, "|")
//	.replace(2, 4, "{" + alter.get(13, 15) + "}")
//	.insert(4, "|")
//	.replace(13, 15, alter.get(2, 4))
//	.wrap(0, string.length, "<<", ">>")
//	.wrap(0, string.length, "((", "))")
//;
//alter.apply() === "((<<[ {x2}| ] <-> [ x|1 ]>>))";
//
////TODO::
//(alter = new StringAlter(string = "[ x1 ] <-> [ x2 ]"))
//	.insert(2, "|")//|x1
//	.insert(3, "|")//x|1
//	.replace(2, 4, "{" + alter.get(13, 15) + "}")
//	.insert(4, "|")//x1|
//	.replace(13, 15, alter.get(2, 4))
//	.wrap(0, string.length, "<<", ">>")
//	.wrap(0, string.length, "((", "))")
//;
//alter.apply() === "((<<[ |{x2}| ] <-> [ x|1 ]>>))";
//
//(alter = new StringAlter(string = "[ x1 ] <-> [ x2 ]"))
//	.insert(2, "|", {extend: true})//|x1
//	.insert(3, "|")//x|1
//	.replace(2, 4, "{" + alter.get(13, 15) + "}")
//	.insert(4, "|", {extend: true})//x1|
//	.replace(13, 15, alter.get(2, 4))
//	.wrap(0, string.length, "<<", ">>")
//	.wrap(0, string.length, "((", "))")
//;
//alter.apply() === "((<<[ {x2} ] <-> [ |x|1| ]>>))";


describe('StringAlter', function() {
	"use strict";

	describe('abstract', function() {

		it("simple", function() {
			var string = "0123456789";
			var alter = new StringAlter(string);
			alter
				.replace(1, 3, "first")
				.replace(5, 9, "second")
			;

			var result = alter.apply();
			expect(result).toEqual("0first34second9");
		});

		it("not-sorted-order", function() {
			var string = "0123456789";
			var alter = new StringAlter(string);
			alter
				.replace(5, 9, "second")
				.replace(1, 3, "first")
			;
			var result = alter.apply();
			expect(result).toEqual("0first34second9");
		});

		it("insert", function() {
			var string = "0123456789";
			var alter = new StringAlter(string);
			alter.insert(5, "0123456789");
			var result = alter.apply();
			expect(result).toEqual("01234012345678956789");
		});

		it("delete", function() {
			var string = "0123456789";
			var alter = new StringAlter(string);
			alter.remove(5, 6);
			var result = alter.apply();
			expect(result).toEqual("012346789");
		});

		it("nop1", function() {
			var string = "0123456789";
			var alter = new StringAlter(string);
			var result = alter.apply();
			expect(result).toEqual("0123456789");
		});

		it("nop2", function() {
			var string = "0123456789";
			var alter = new StringAlter(string);
			alter.insert(5, "");
			var result = alter.apply();
			expect(result).toEqual("0123456789");
		});

		it("nop3", function() {
			var string = "0123456789";
			var alter = new StringAlter(string);
			alter.remove(5, 5);
			var result = alter.apply();
			expect(result).toEqual("0123456789");
		});

		it("simple tokens", function() {
			var string = "12345 67890";
			var alter = new StringAlter(string);
			alter.replace(5, 6, "|" + alter.get(6, 11) + "|");
			var result = alter.apply();
			expect(result).toEqual("12345|67890|67890");
		});

		it("interchanging", function() {
			var string = "[ x1 ] <-> [ x2 ]";
			var alter = new StringAlter(string);
			alter
				.replace(13, 15, alter.get(2, 4))
				.replace(2, 4, alter.get(13, 15))
			;
			var result = alter.apply();
			expect(result).toEqual("[ x2 ] <-> [ x1 ]");
		});

		it("inner", function() {
			var string = "[ ( [ x2 ] <-> [ x3 ] ) ]";
			var alter = new StringAlter(string);
			alter
				.replace(6, 8, alter.get(17, 19))
				.replace(17, 19, alter.get(6, 8))
				.replace(0, 25, "((" + alter.get(0, 25) + "))")
			;
			var result = alter.apply();
			expect(result).toEqual("(([ ( [ x3 ] <-> [ x2 ] ) ]))");

			alter = new StringAlter(string);
			alter
				.replace(6, 8, alter.get(17, 19))
				.replace(17, 19, alter.get(6, 8))
				.wrap(0, 25, "((", "))")
			;
			result = alter.apply();
			expect(result).toEqual("(([ ( [ x3 ] <-> [ x2 ] ) ]))");
		});

		it("inner inner", function() {
			var string = "[ ( [ x2 ] <-> [ x3 ] ) ]";
			var alter = new StringAlter(string);
			alter
				.replace(6, 8, alter.get(17, 19))
				.replace(17, 19, alter.get(6, 8))
				.replace(0, 25, "((" + alter.get(0, 25) + "))")
				.replace(0, 25, "{" + alter.get(0, 25) + "}")
			;
			var result = alter.apply();
			expect(result).toEqual("{(([ ( [ x3 ] <-> [ x2 ] ) ]))}");

			alter = new StringAlter(string);
			alter
				.replace(6, 8, alter.get(17, 19))
				.replace(17, 19, alter.get(6, 8))
				.wrap(0, 25, "((", "))")
				.wrap(0, 25, "{", "}")
			;
			result = alter.apply();
			expect(result).toEqual("{(([ ( [ x3 ] <-> [ x2 ] ) ]))}");
		});

		it("inner inner with adding", function() {
			var string = "[ ( [ x2 ] <-> [ x3 ] ) ]";
			var alter = new StringAlter(string);
			alter
				.replace(6, 8, alter.get(17, 19))
				.replace(17, 19, alter.get(6, 8))
				.insert(0, "--")
				.insert(25, "--")
				.replace(0, 25, "((" + alter.get(0, 25) + "))")
				.replace(0, 25, "{" + alter.get(0, 25) + "}")
			;
			var result = alter.apply();
			expect(result).toEqual("--{(([ ( [ x3 ] <-> [ x2 ] ) ]))}--");

			alter = new StringAlter(string);
			alter
				.replace(6, 8, alter.get(17, 19))
				.replace(17, 19, alter.get(6, 8))
				.insert(0, "--")
				.insert(25, "--")
				.wrap(0, 25, "((", "))")
				.wrap(0, 25, "{", "}")
			;
			result = alter.apply();
			expect(result).toEqual("--{(([ ( [ x3 ] <-> [ x2 ] ) ]))}--");
		});

		it("inner inner with extended adding", function() {
			//TODO::
			var string = "[ ( [ x2 ] <-> [ x3 ] ) ]";
			var alter = new StringAlter(string);
			alter
				.replace(6, 8, alter.get(17, 19))
				.replace(17, 19, alter.get(6, 8))
				.insert(0, "--", {extend: true})
				.insert(25, "--", {extend: true})
				.replace(0, 25, "((" + alter.get(0, 25) + "))")
				.replace(0, 25, "{" + alter.get(0, 25) + "}")
			;
			var result = alter.apply();//TODO::
			expect(result).toEqual("{((--[ ( [ x3 ] <-> [ x2 ] ) ]--))}");

			alter = new StringAlter(string);
			alter
				.replace(6, 8, alter.get(17, 19))
				.replace(17, 19, alter.get(6, 8))
				.insert(0, "--", {extend: true})
				.insert(25, "--", {extend: true})
				.wrap(0, 25, "((", "))")
				.wrap(0, 25, "{", "}")
			;
			result = alter.apply();
			expect(result).toEqual("{((--[ ( [ x3 ] <-> [ x2 ] ) ]--))}");
		});

		it("inner inner inner", function() {
			var string = "[ ( [ x2 ] <-> [ x3 ] ) ]";
			var alter = new StringAlter(string);
			alter
				.replace(6, 8, alter.get(17, 19))
				.replace(17, 19, alter.get(6, 8))
				.replace(0, 25, "((" + alter.get(0, 25) + "))")
				.replace(0, 25, "{" + alter.get(0, 25) + "}")
				.replace(0, 25, "<" + alter.get(0, 25) + ">")
			;
			var result = alter.apply();
			expect(result).toEqual("<{(([ ( [ x3 ] <-> [ x2 ] ) ]))}>");

			alter = new StringAlter(string);
			alter
				.replace(6, 8, alter.get(17, 19))
				.replace(17, 19, alter.get(6, 8))
				.wrap(0, 25, "((", "))")
				.wrap(0, 25, "{", "}")
				.wrap(0, 25, "<", ">")
			;
			result = alter.apply();
			expect(result).toEqual("<{(([ ( [ x3 ] <-> [ x2 ] ) ]))}>");
		});

		// TODO::
	//	it("interchanging with inner", function() {
	//		var source = "[ x1 ] <-> [ ( [ x2 ] <-> [ x3 ] ) ]";
	//		var fragments = [
	//			{start: 2, end: 4, str: stringAlter.getFromToString(13, 34)}
	//			, {start: 13, end: 34, str: stringAlter.getFromToString(2, 4)}
	//			, {start: 17, end: 19, str: stringAlter.getFromToString(28, 30)}
	//			, {start: 28, end: 30, str: stringAlter.getFromToString(17, 19)}
	//		];
	//		var result = "[ ( [ x3 ] <-> [ x2 ] ) ] <-> [ x1 ]";
	//
	//		expect(stringAlter.alter(source, fragments)).toEqual(result);
	//	});
	});

	describe('code', function() {
		it("1", function() {
			var string = '"use strict";' +
				'function fn() {' +
				'	let {x} = {x:  3};' +
				'	if (true) {' +
				'		let x = 4;' +
				'		console.log(x);' +
				'	}' +
				'	console.log(x);' +
				'}'
			;
			var expectedResult = '"use strict";' +
				'function fn() {var $__0;' +
				'	var x = ($__0 = {x:  3}).x;' +
				'	if (true) {' +
				'		var x$0 = 4;' +
				'		console.log(x$0);' +
				'	}' +
				'	console.log(x);' +
				'}'
			;
			var alter = new StringAlter(string);
			alter
				.replace(29, 32, "var")
				.replace(61, 64, "var")
				.replace(65, 66, "x$0")
				.replace(85, 86, "x$0")
				.replace(33, 36, alter.get(34, 35))
				.insert(28, "var $__0;")
				.replace(39, 46, "($__0 = " + alter.get(39, 46) + ")." + alter.get(34, 35))
			;
			var result = alter.apply();
			expect(result).toEqual(expectedResult);
		});

		it("2", function() {
			var string = 'let x = (a, b, c = 998) =>' +
				'a + b + c;console.log(x(1, 1) === 1000)'
				+ '\n'
				+ 'console.log(((function(){return (a)=>a*22.032})())("321") === "321"*22.032)'
			;
			var expectedResult = 'var x = function(a, b)' +
				'{var c = arguments[2];if(c === void 0)c = 998;return a + b + c};console.log(x(1, 1) === 1000)'
				+ '\n'
				+ 'console.log(((function(){return function(a){return a*22.032}})())("321") === "321"*22.032)'
			;
			var alter = new StringAlter(string);
			alter
				.replace(0, 3, "var")
				.insert(8, "function")
				.remove(13, 22)
				.remove(23, 26)
				.wrap(26, 35, "{", "}", {extend: true})
				.insert(
					26
					, "var " + alter.get(15, 16) + " = arguments[2];if(" + alter.get(15, 16) + " === void 0)" + alter.get(15, 16) + " = " + alter.get(19, 22) + ";"
					//, {priority: 0}
				)
				.insert(26, "return ")
				.insert(98, "function")
				.remove(101, 103)
				.wrap(103, 111, "{", "}", {extend: true})
				.insert(103, "return ")
			;
			var result = alter.apply();
			expect(result).toEqual(expectedResult);
		});

		it("3", function() {
			var string =
				'class Record {\n' +
				'	constructor(from, to) {\n' +
				'		this.from = from;\n' +
				'		this.to = to;\n' +
				'	}\n' +
				'\n' +
				'	toString() {\n' +
				'		return ""\n' +
				'	}\n' +
				'}'
			;
			var expectedResult =
				'var Record = (function(){\n' +
				'	function Record(from, to) {\n' +
				'		this.from = from;\n' +
				'		this.to = to;\n' +
				'	}\n' +
				'\n' +
				'	Record.prototype.toString = function() {\n' +
				'		return ""\n' +
				'	}\n' +
				'return Record;})();'
			;
			var alter = new StringAlter(string);
			alter
				.replace(0, 13, "var Record = (function()")
				.replace(16, 27, "function Record")
				.insert(81, "Record.prototype.")
				.insert(89, " = function")
				.insert(109, "return Record;")
				.insert(110, ")();")
			;
			var result = alter.apply();
			expect(result).toEqual(expectedResult);
		});

		it("4", function() {
			var string =
				'function test() {\n' +
				'	function test4(ssssss, fffffffff = [], ooooooo = []) {}\n' +
				'	{let test;}\n' +
				'\n' +
				'	for (let i ; false ; ) {\n' +
				'		let {test} = this.testtesttest((test||{}).a, (test||{}).b);\n' +
				'	}\n' +
				'}\n'
			;
			var expectedResult =
				'function test() {\n' +
				'	function test4(ssssss) {var fffffffff = arguments[1];if(fffffffff === void 0)fffffffff = [];var ooooooo = arguments[2];if(ooooooo === void 0)ooooooo = [];}\n' +
				'	{var test;}\n' +
				'\n' +
				'	for (var i ; false ; ) {\n' +
				'		var test$0 = (this.testtesttest((test$0||{}).a, (test$0||{}).b)).test;\n' +
				'	}\n' +
				'}\n'
			;
			var alter = new StringAlter(string);
			alter
				.replace(77, 80, "var")
				.replace(95, 98, "var")
				.replace(117, 120, "var")
				.replace(149, 153, "test$0")
				.replace(163, 167, "test$0")
				.remove(40, 56)
				.remove(56, 70)
				.insert(73,
					"var fffffffff = arguments[1];if(fffffffff === void 0)fffffffff = "
						+ alter.get(54, 56)
						+ ";var ooooooo = arguments[2];if(ooooooo === void 0)ooooooo = "
						+ alter.get(68, 70)
						+ ";"
				)
				.replace(121, 175, "test$0 = (" + alter.get(130, 175) + ").test")
			;

			// For tests:
//			alter
//				.replace(77, 80, "var")
//				.replace(95, 98, "var")
//				//.replace(117, 120, "var")
//				.replace(149, 153, "test$0")
//				//.replace(163, 167, "test$0")
//				//.remove(40, 56)
//				//.remove(56, 70)
//				.insert(73,
//					"var fffffffff = arguments[1];if(fffffffff === void 0)fffffffff = "
//					+ '[]'
//					+ ";var ooooooo = arguments[2];if(ooooooo === void 0)ooooooo = "
//					+ '[]'
//					+ ";"
//				)
//				.replace(121, 175, "1")
//			;

			var result = alter.apply();
			expect(result).toEqual(expectedResult);
		});

		it("get extended value", function() {
			var string =
				'var a = 1;\n' +
				'{\n' +
				'	let a = 2;\n' +
				'	var b = `${a}`;' +
				'}'
			;
			var expectedResult =
				'var a = 1;\n' +
				'{\n' +
				'	var a$0 = 2;\n' +
				'	var b = (("" + a$0) + "");' +
				'}'
			;
			var alter = new StringAlter(string);
			alter
				.replace(14, 17, "var")
				.replace(18, 19, "a$0")
				.replace(37, 38, "a$0")
				.replace(34, 40, '(("" + ' + alter.get(37, 38) + ') + "")')
			;
			var result = alter.apply();
			expect(result).toEqual(expectedResult);
		});

		it("insert/replace together 1", function() {
			var string =
				'let a = 1, obj;\n' +
				'{\n' +
				'	let a = void 0, obj = { test2: ( ({a = 9}) = {a: a} ).a };\n' +
				'}'
			;
			var expectedResult =
				'var $D$0;var $D$1;var a = 1, obj;\n' +
				'{\n' +
				'	var a$0 = void 0, obj$0 = { test2: ( a$0 = (($D$0 = ($D$1 = ({a: a$0})).a) === void 0 ? 9 : $D$0), $D$1 ).a };\n' +
				'}'
			;
			var alter = new StringAlter(string);
			alter
				.replace(0, 3, "var")
				.replace(19, 22, "var")
				.replace(23, 24, "a$0")
				.replace(35, 38, "obj$0")
				.replace(54, 55, "a$0")
				.replace(68, 69, "a$0")
				.insert(0, "var $D$0;", {before: true})
				.insert(0, "var $D$1;", {before: true})
				.replace(52, 70, "a$0 = (($D$0 = ($D$1 = (" + alter.get(64, 70) + ")).a) === void 0 ? " + alter.get(58, 59) + " : $D$0), $D$1")
			;
			var result = alter.apply();
			expect(result).toEqual(expectedResult);

			var alter = new StringAlter(string);
			alter
				.insert(0, "var $D$0;", {before: true})
				.insert(0, "var $D$1;", {before: true})
				.replace(0, 3, "var")
				.replace(19, 22, "var")
				.replace(23, 24, "a$0")
				.replace(35, 38, "obj$0")
				.replace(54, 55, "a$0")
				.replace(68, 69, "a$0")
				.replace(52, 70, "a$0 = (($D$0 = ($D$1 = (" + alter.get(64, 70) + ")).a) === void 0 ? " + alter.get(58, 59) + " : $D$0), $D$1")
			;
			var result = alter.apply();
			expect(result).toEqual(expectedResult);
		});

		it("insert/replace together 2", function() {
			var string =
				'{let a}\n' +
				'{let a;var {a1}={a1: a};}\n' +
				'{let a;var {a2}={a2: a};}\n' +
				'{let a;var {a3}={a3: a};}'
			;
			var expectedResult =
				'{var a}\n' +
				'{var a$0;var a1 = ({a1: a$0}).a1;}\n' +
				'{var a$1;var a2 = ({a2: a$1}).a2;}\n' +
				'{var a$2;var a3 = ({a3: a$2}).a3;}'
			;
			var alter = new StringAlter(string);
			alter
				.replace(1, 4, "var")
				.replace(9, 12, "var")
				.replace(13, 14, "a$0")
				.replace(29, 30, "a$0")
				.replace(19, 31, "a1 = (" + alter.get(24, 31) + ").a1")
				.replace(35, 38, "var")
				.replace(39, 40, "a$1")
				.replace(55, 56, "a$1")
				.replace(45, 57, "a2 = (" + alter.get(50, 57) + ").a2")
				.replace(61, 64, "var")
				.replace(65, 66, "a$2")
				.replace(81, 82, "a$2")
				.replace(71, 83, "a3 = (" + alter.get(76, 83) + ").a3")
			;

			var result = alter.apply();
			expect(result).toEqual(expectedResult);
		});

		it("insert/replace with inner changes", function() {
			var string =
				'var a, test1;\n' +
				'\n' +
				'{\n' +
				'	let a = void 0, test1;\n' +
				'\n' +
				'	var obj = {\n' +
				'		a: ( ({a = 9}) = {} ).a\n' +
				'		, b: ( ({test1}) = {test1: test1} ).test1\n' +
				'	}\n' +
				'}'
			;
			var expectedResult =
				'var $D$0;var a, test1;\n' +
				'\n' +
				'{\n' +
				'	var a$0 = void 0, test1$0;\n' +
				'\n' +
				'	var obj = {\n' +
				'		a: ( a$0 = (($D$0 = ({}).a) === void 0 ? 9 : $D$0), ({}) ).a\n' +
				'		, b: ( test1$0 = ({test1: test1$0}).test1, ({test1: test1$0}) ).test1\n' +
				'	}\n' +
				'}'
			;
			var alter = new StringAlter(string);
			alter
				.insert(0, "var $D$0;")
				.replace(18, 21, "var")
				.replace(22, 23, "a$0")
				.replace(34, 39, "test1$0")
				.replace(64, 65, "a$0")
				.replace(62, 76, "a$0 = (($D$0 = (" + alter.get(74, 76) + ").a) === void 0 ? " + alter.get(68, 69) + " : $D$0), (" + alter.get(74, 76) + ")")
				.replace(92, 97, "test1$0")
				.replace(110, 115, "test1$0")
				.replace(90, 116, "test1$0 = (" + alter.get(102, 116) + ").test1, (" + alter.get(102, 116) + ")")
			;

			var result = alter.apply();
			expect(result).toEqual(expectedResult);
		});

		it("wrap/insert", function() {
			var string =
				'var x = (c = 9) =>c;' +
				'((function(){return (a)=>a})())(1);'+
				'var z = (...rest)=>rest.map((a)=>a + 1);'+
				'var y = (a = 1) => a'
			;
			var expectedResult =
				'var x = function() {var c = arguments[0];if(c === void 0)c = 9;return c};' +
				'((function(){return function(a){return a}})())(1);' +
				'var z = function(){var SLICE$0 = Array.prototype.slice;var rest = SLICE$0.call(arguments, 0);return rest.map(function(a){return a + 1})};' +
				'var y = function()  {var a = arguments[0];if(a === void 0)a = 1;return a}'
			;
			var alter = new StringAlter(string);
			alter
				.insertBefore(8, "function")
				.replace(14, 18, alter.get(14, 18), {
					transform: function(str) {
						return str.replace(/=>/gi, "");
					}
				})
				.wrap(18, 19, "{", "}")
				.remove(9, 14)
				.insert(18, "var c = arguments[0];if(c === void 0)c = " + alter.get(13, 14) + ";return ")

				.insertBefore(40, "function")
				.replace(42, 45, alter.get(42, 45), {
					transform: function(str) {
						return str.replace(/=>/gi, "");
					}
				})
				.wrap(45, 46, "{", "}")
				.insert(45, "return ")

				.insertBefore(63, "function")
				.replace(71, 74, alter.get(71, 74), {
					transform: function(str) {
						return str.replace(/=>/gi, "");
					}
				})
				.wrap(74, 94, "{", "}")
				.insert(74, "var SLICE$0 = Array.prototype.slice;")
				.remove(64, 71)
				.insert(74, "var rest = SLICE$0.call(arguments, 0);return ")

				.insertBefore(83, "function")
				.replace(85, 88, alter.get(85, 88), {
					transform: function(str) {
						return str.replace(/=>/gi, "");
					}
				})
				.wrap(88, 93, "{", "}")
				.insert(88, "return ")

				.insertBefore(103, "function")
				.replace(109, 114, alter.get(109, 114), {
					transform: function(str) {
						return str.replace(/=>/gi, "");
					}
				})
				.wrap(114, 115, "{", "}")
				.remove(104, 109)
				.insert(114, "var a = arguments[0];if(a === void 0)a = " + alter.get(108, 109) + ";return ")
			;

			var result = alter.apply();
			expect(result).toEqual(expectedResult);
		});
	});
});

















