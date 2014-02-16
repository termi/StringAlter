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

	describe('methods', function() {
//		TODO::
//		it("insert", function() {
//			var string = "0123456789";
//			var alter = new StringAlter(string);
//			alter
//				.insert(1, "first")
//			;
//
//			var result = alter.apply();
//			expect(result).toEqual("0first34second9");
//		});
//		insertBefore
//		insertAfter
//		insert with options

//		TODO:
//		replace, move, wrap

		describe('get', function() {
			it("string before", function() {
				var string = "Y + X = X + 9";
				var alter = new StringAlter(string);
				alter
					.replace(4, 5, "Z")
					.replace(8, 9, alter.get(4, 5), {applyChanges: true})
				;

				var result = alter.apply();
				expect(result).toEqual("Y + Z = Z + 9");
			});

			it("string inside", function() {
				var string = "Y + (X + 9) = 0";
				var alter = new StringAlter(string);
				alter
					.replace(5, 6, "Z")
					.replace(4, 11, alter.get(5, 6))
					.replace(14, 15, "-" + alter.get(9, 10))
				;

				var result = alter.apply();
				expect(result).toEqual("Y + Z = -9");
			});

			describe("string after", function() {
				it("simple", function() {
					var string = "Y + X = X + 9";
					var alter = new StringAlter(string);
					alter
						.replace(8, 9, "Z")
						.replace(4, 5, alter.get(8, 9), {applyChanges: true})
					;

					var result = alter.apply();
					expect(result).toEqual("Y + Z = Z + 9");
				});

				it("inner 1", function() {
					var string = "Y + X = X + 9";
					var alter = new StringAlter(string);
					alter
						.replace(8, 9, "Z")
						.replace(8, 9, alter.get(8, 9) + " + 5")
						.wrap(8, 9, "(", ")", {extend: true})
						.replace(4, 5, alter.get(8, 9), {applyChanges: true})
					;

					var result = alter.apply();
					expect(result).toEqual("Y + (Z + 5) = (Z + 5) + 9");
				});

				it("inner 2", function() {
					var string = "Y + X = X + 9";
					var alter = new StringAlter(string);
					alter
						.replace(8, 9, "Z")
						.replace(8, 9, alter.get(8, 9) + " + 5")
						.wrap(8, 9, "(", ")")
						.replace(4, 5, alter.get(8, 9), {applyChanges: true})
					;

					var result = alter.apply();
					expect(result).toEqual("Y + Z + 5 = (Z + 5) + 9");
				});

				it("inner 3", function() {
					var string = "(1 + 3) + X = 6";
					var alter = new StringAlter(string);
					alter
						.replace(0, 7, "4")
						.remove(7, 10)
						.insertBefore(15, " - ")
						.move(0, 7, 15)
					;

					var result = alter.apply();
					expect(result).toEqual("X = 6 - 4");
				});

				it("inner and changes after apply", function() {
					var string = "(1 + 3) + X = 6";
					var alter = new StringAlter(string);
					alter
						.replace(0, 7, "4")
						.remove(7, 10)
						.insertBefore(15, " - ")
						.insert(15, alter.get(0, 7), {__newTransitionalSubLogic: true})
					;

					alter.apply();
					alter.remove(0, 7);
					
					var result = alter.apply();
					expect(result).toEqual("X = 6 - 4");
				});

				it("inner (code)", function() {
					var string = "\n\r" +
						"{\n\r" +
						"	let arr,f\n\r" +
						"}\n\r" +
						"\n\r" +
						"{\n\r" +
						"	var output = [];\n\r" +
						"	let arr = [1, 2, 3];\n\r" +
						"	for(var f of arr ) {\n\r" +
						"		output.push(f)\n\r" +
						"	};\n\r" +
						"};"
					;
					var expectedResult = "function GET_ITER$0(v){if(v){if(Array.isArray(v))return 0;if(typeof v==='object'&&typeof v['iterator']==='function')return v['iterator']();}throw new Error(v+' is not iterable')};var $D$0;var $D$1;var $D$2;\n\r" +
						"{\n\r" +
						"	var arr,f\n\r" +
						"}\n\r" +
						"\n\r" +
						"{\n\r" +
						"	var output = [];\n\r" +
						"	var arr$0 = [1, 2, 3];\n\r" +
						"	$D$0 = GET_ITER$0(arr$0);$D$1 = $D$0 === 0;$D$2 = ($D$1 ? arr$0.length : void 0);for(var f$0 ; $D$1 ? ($D$0 < $D$2) : !($D$2 = $D$0[\"next\"]())[\"done\"];  ) {f$0 = ($D$1 ? arr$0[$D$0++] : $D$2[\"value\"]);\n\r" +
						"		output.push(f$0)\n\r" +
						"	};;$D$0 = $D$1 = $D$2 = void 0;\n\r" +
						"};"
					;

					var alter = new StringAlter(string);
					alter
						.replace(6, 9, "var")
						.replace(45, 48, "var")
						.replace(49, 52, "arr$0")
						.replace(81, 84, "arr$0" )  // main change in this test, relative inner for change #OUTER
						.replace(76, 77, "f$0")
						.replace(104, 105, "f$0")
						.insert(0, 'function GET_ITER$0(v){if(v){if(Array.isArray(v))return 0;if(typeof v===\'object\'&&typeof v[\'iterator\']===\'function\')return v[\'iterator\']();}throw new Error(v+\' is not iterable\')};')
						.insert(0, "var $D$0;")
						.insert(0, "var $D$1;")
						.insert(0, "var $D$2;")
						.insert(68,
							"$D$0 = GET_ITER$0("
								+ alter.get(49, 52)
								+ ");$D$1 = $D$0 === 0;$D$2 = ($D$1 ? "
								+ alter.get(49, 52)
								+ ".length : void 0);"
							, { extend: true, applyChanges: true }
						)
						.replace(78, 84             //change #OUTER
							, "; $D$1 ? ($D$0 < $D$2) : !($D$2 = $D$0[\"next\"]())[\"done\"]; "
						)
						.insertBefore(88, alter.get(76, 77) + " = ($D$1 ? " + alter.get(49, 52) + "[$D$0++] : $D$2[\"value\"]);")
						.insertAfter(111, ";$D$0 = $D$1 = $D$2 = void 0;", { extend: true })
					;

					var result = alter.apply();
					expect(result).toEqual(expectedResult);
				});
			});


		});

		describe("groupedFragments", function() {
			describe("string after", function() {
				it("inner", function() {
					var string = "Y + X = X + 9";
					var alter = new StringAlter(string);
					alter
						.replace(8, 9, "Z", {_test_parent_id: 1})
						.wrap(8, 9, "(", ")", {extend: true, _test_parent_id: 1})
						.replace(8, 9, "X + 5", { _test_id: 1, _test_should_have_childer: true })
						.replace(4, 5, alter.get(8, 9), {applyChanges: true})
					;

					var fragments = alter.groupedFragments();

					expect(
						fragments.every(function testFrag(frag) {
							var options = (frag.options || {});
							var id = options._test_id;

							if( options._test_should_have_childer ) {
								var subs = frag.getSubs();
								if( Array.isArray(subs) && subs.length ) {
									return subs.every(function(subFrag) {
										var options = (subFrag.options || {});
										var parentId = options._test_parent_id;

										return parentId === id
											&& options._test_should_have_childer
												? testFrag(subFrag)
												: true
										;
									})
								}
								return false;
							}

							return !options._test_parent_id;
						})
					).toBe(true);
				});

				// TODO::
//				it("inner #2", function() {
//					var string = "18 + X/2 = 9";
//					var alter = new StringAlter(string);
//					alter
//						.replace(5, 8, alter.get(5, 6) + "/2", {_test_parent_id: 1})
//						.replace(5, 6, "X + 5", { _test_id: 1, _test_should_have_childer: true })
//					;
//
//					var fragments = alter.groupedFragments();
//
//
//				});
			});
		});

		describe('remove', function() {
			it("step-by-step", function() {
				var string = "let x = [1, ...[2, 3], ... [...[4, 5]]];";
				var alter = new StringAlter(string);
				alter
					.remove(12, 16)
					.remove(20, 21)
					.remove(23, 28)
					.remove(28, 32)
					.remove(36, 37)
					.remove(37, 38)
				;

				var result = alter.apply();
				expect(result).toEqual("let x = [1, 2, 3, 4, 5];");
			});

			it("with insert/get", function() {
				var string =
						'function t(a = [...a]) {}'
					;
				var alter = new StringAlter(string);
				alter
					.remove(11, 21)
					.insert(24, "var arr = arguments[0];if(arr === void 0)arr = " + alter.get(15, 21) + ";", {"__newTransitionalSubLogic":true})
					.insertBefore(24, "function ITER$0(v){return v}")
					.remove(15, 19)
					.insertBefore(19, 'ITER$0(')
					.remove(20, 21)//remove last ']'
					.insert(20, ')')
				;
				var result = alter.apply();
				expect(result).toEqual("function t() {function ITER$0(v){return v}var arr = arguments[0];if(arr === void 0)arr = ITER$0(a);}");
			});

			it("with insert/get/replace", function() {
				var string = "function test(arr = [...a, ...a]) { return arr }";
				var alter = new StringAlter(string);
				alter
					.insert(35, 'var arr = arguments[0];if(arr === void 0)arr = ' + alter.get(20, 32) + ';', { __newTransitionalSubLogic: true })
					.insert(35, 'function ITER$0(v){return v};', { before: true } )
					.remove(21, 24)
					.insert(24, ' ].concat(ITER$0(', { before: true })
					.insert(25, ', true)')
					.replace(25, 30, ', ITER$0(')
					.insert(31, '))', {before: true})
					.remove(31, 32)
				;

				alter.apply();
				alter.remove(14, 32);
				var result = alter.apply();

				expect(result).toEqual("function test() {function ITER$0(v){return v};var arr = arguments[0];if(arr === void 0)arr = [ ].concat(ITER$0(a, true), ITER$0(a)); return arr }");
			});

//			it("with move", function() {
//				var string = "let x = [1, ...[2, 3], ... [...[4, 5]]];";
//				var alter = new StringAlter(string);
//				alter
//					.TODO
//				;
//
//				var result = alter.apply();
//				expect(result).toEqual("let x = [1, 2, 3, 4, 5];");
//			});
		});

		describe('setState/restoreState', function() {
			it("remove/insert", function() {
				var string = "function t({c: d} = 1, ...rest){}";
				var alter = new StringAlter(string);
				alter
					.setState('default_remove')
						.remove(11, 21)
					.restoreState()
					.setState('default_remove')
						.remove(21, 30)
					.restoreState()

					.insertBefore(32, 'var SLICE$0 = Array.prototype.slice;')
					.insert
						(32
						, 'var d = (arguments[0] !== void 0 ? arguments[0] : ' + alter.get(20, 21) + ').c;var rest = SLICE$0.call(arguments, 1);'
						, { __newTransitionalSubLogic: true }
					)
				;

				var result = alter.apply();
				expect(result).toEqual("function t(){var SLICE$0 = Array.prototype.slice;var d = (arguments[0] !== void 0 ? arguments[0] : 1).c;var rest = SLICE$0.call(arguments, 1);}");

				string = "var a = [];function test(arr = [...a, ...a]) { return arr }";
				alter = new StringAlter(string);
				alter
					.insert
						(46
						, 'var arr = arguments[0];if(arr === void 0)arr = ' + alter.get(31, 43) + ';'
						, { __newTransitionalSubLogic: true }
					)
					.insertBefore(46, 'function ITER$0(v){return v};')
					.remove(32, 35)
					.insertBefore(35, ' ].concat(ITER$0(')
					.insert(36, ', true)')
					.replace(36, 41, ', ITER$0(')
					.insert(42, '))')
					.remove(42, 43)
					.setState('default_remove')
						.remove(25, 43)
					.restoreState()
				;

				var result = alter.apply();
				expect(result).toEqual("var a = [];function test() {function ITER$0(v){return v};var arr = arguments[0];if(arr === void 0)arr = [ ].concat(ITER$0(a, true), ITER$0(a)); return arr }");
			});

			it("remove in another stage after insert/replace", function() {
				var string = "var y1 = (a = 1) => (  a + 1  , a  )";
				var alter = new StringAlter(string);
				alter
					.insert(9, 'function')
					.replace(15, 23, alter.get(15, 23), {transformUniq: 1, transform: function(str) { return str.replace(/=>/gi, "").replace(/\(/gi, "") }})
					.insertBefore(23, '{', {extend: true})
					.insert(36, '}', {extend: true})
					.insert(23, 'var a = arguments[0];if(a === void 0)a = ' + alter.get(14, 15) + ';return (', {"__newTransitionalSubLogic":true})
					.setState('default_remove')
						.remove(10, 15)
					.restoreState()
				;

				var result = alter.apply();
				expect(result).toEqual("var y1 = function()    {var a = arguments[0];if(a === void 0)a = 1;return (a + 1  , a  )}");

			});
		});


	})

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
			var string = 'let x = (a, b, c = 998) =>'
				+ 'a + b + c;console.log(x(1, 1) === 1000)'
				+ '\n'
				+ 'console.log(((function(){return (a)=>a*22.032})())("321") === "321"*22.032)'
			;
			var expectedResult = 'var x = function(a, b)'
				+ '{var c = arguments[2];if(c === void 0)c = 998;return a + b + c};console.log(x(1, 1) === 1000)'
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

		it("5", function() {
			var string =
					'\n\r(function(a)[])(...[1])'
				;
			var expectedResult =
					"function ITER$0(v,f){if(v){if(Array.isArray(v))return f?v.slice():v;if(typeof v==='object'&&typeof v['iterator']==='function')return Array['from'](v);}throw new Error(v+' is not iterable')};"
					+ "\n\r(function(a){return []}).apply(null, ITER$0([1]))"
				;
			var alter = new StringAlter(string);
			alter
				.wrap(14, 16, "{", "}", { extend: true })
				.insert(14, "return ")
				.insert(0, 'function ITER$0(v,f){if(v){if(Array.isArray(v))return f?v.slice():v;if(typeof v===\'object\'&&typeof v[\'iterator\']===\'function\')return Array[\'from\'](v);}throw new Error(v+\' is not iterable\')};')
				.replace(2, 25, "(" + alter.get(3, 16) + ").apply(null, ITER$0(" + alter.get(21, 24) + "))")
			;
			var result = alter.apply();
			expect(result).toEqual(expectedResult);
		});

		it("6", function() {
			var string =
					'var a = [1, 2];\n\r'
					+ 'function t(arr = [...a, ...(([a, b = 4], c = 3)=>[a, b, c])([a[1]+1]), ...a.reverse()]) {  }'
				;
			var alter = new StringAlter(string);
			alter
				.remove(28, 103)
				.insert(106, "var arr = arguments[0];if(arr === void 0)arr = " + alter.get(34, 103) + ";", {"__newTransitionalSubLogic":true})
				.insert(45, "function")
				//.replace(63, 66, alter.get(63, 66), {"transformUniq":1, transform: function(str) { return str.replace(/=>/gi, "  ").replace(/\)/gi, ")") }})
				.replace(63, 66, ")")
				.insertBefore(66, "{", {"extend":true})
				.insert(75, "}", {"extend":true})
				.replace(46, 56, "b")
				.remove(56, 63)
				.insert(
					66
					, 'var a = b[0], b = ((b = b[1]) === void 0 ? '
						+ alter.get(54, 55)
						+ ' : b);var c = arguments[1];if(c === void 0)c = '
						+ alter.get(62, 63)
						+ ';return '
					, {"__newTransitionalSubLogic":true}
				)
				.insertBefore(106, "function ITER$0(v){return v}")
				.remove(35, 38)
				.insertBefore(38, " ].concat(ITER$0(")
				.insert(39, ", true)")
				.replace(39, 44, ", ITER$0(")
				.insert(86, ")")
				.replace(86, 91, ", ITER$0(")
				.insert(102, "))")
				.remove(102, 103)
			;
			var result = alter.apply();
			expect(result).toEqual("var a = [1, 2];\n\rfunction t() {function ITER$0(v){return v}var arr = arguments[0];if(arr === void 0)arr = [ ].concat(ITER$0(a, true), ITER$0((function(b){var a = b[0], b = ((b = b[1]) === void 0 ? 4 : b);var c = arguments[1];if(c === void 0)c = 3;return [a, b, c]})([a[1]+1])), ITER$0(a.reverse()));  }");
		});

		it("using transform", function() {
			var string = '\n\r'
				+ '{\n\r'
				+ '	let test11 = function() (  [123, 123])\n\r'
				+ '\n\r'
				+ '	let test12 = function() ([1, 2])\n\r'
				+ '\n\r'
				+ '	let test13 = function() [1, 2]\n\r'
				+ '\n\r'
				+ '}\n\r'
			;
			var expectedResult = '\n\r'
				+ '{\n\r'
				+ '	let test11 = function()   {return [123, 123]}\n\r'
				+ '\n\r'
				+ '	let test12 = function() {return [1, 2]}\n\r'
				+ '\n\r'
				+ '	let test13 = function() {return [1, 2]}\n\r'
				+ '\n\r'
				+ '}\n\r'
			;
			var alter = new StringAlter(string);
			alter
				.replace(27, 31, alter.get(27, 31), {transform: function(str){ return "(" + str.replace(/\(/gi, "") }})
				.wrap(33, 43, "{", "}", { extend: true })
				.replace(43, 44, alter.get(43, 44), {transform: function(str){ return str.replace(/\)/gi, "") }})
				.insert(33, "return ")

				.replace(70, 74, alter.get(70, 74), {transform: function(str){ return "(" + str.replace(/\(/gi, "") }})
				.wrap(74, 80, "{", "}", { extend: true })
				.replace(80, 81, alter.get(80, 81), {transform: function(str){ return str.replace(/\)/gi, "") }})
				.insert(74, "return ")

				.wrap(110, 116, "{", "}", { extend: true })
				.insert(110, "return ")
			;
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

			alter = new StringAlter(string);
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
			result = alter.apply();
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
				'{var a$0;var a1=({a1: a$0}).a1;}\n' +
				'{var a$1;var a2=({a2: a$1}).a2;}\n' +
				'{var a$2;var a3=({a3: a$2}).a3;}'
			;
			var alter = new StringAlter(string);
			alter
				.replace(1, 4, "var")
				.replace(9, 12, "var")
				.replace(13, 14, "a$0")
				.replace(29, 30, "a$0")
				.replace(19, 31, "a1=(" + alter.get(24, 31) + ").a1")
				.replace(35, 38, "var")
				.replace(39, 40, "a$1")
				.replace(55, 56, "a$1")
				.replace(45, 57, "a2=(" + alter.get(50, 57) + ").a2")
				.replace(61, 64, "var")
				.replace(65, 66, "a$2")
				.replace(81, 82, "a$2")
				.replace(71, 83, "a3=(" + alter.get(76, 83) + ").a3")
			;

			var result = alter.apply();
			expect(result).toEqual(expectedResult);

			alter = new StringAlter(string);
			alter
				.replace(1, 4, "var")
				.replace(9, 12, "var")
				.replace(13, 14, "a$0")
				.replace(29, 30, "a$0")
				.replace(19, 23, "a1")
				.wrap(24, 31, "(", ").a1")
				.replace(35, 38, "var")
				.replace(39, 40, "a$1")
				.replace(55, 56, "a$1")
				.replace(45, 49, "a2")
				.wrap(50, 57, "(", ").a2")
				.replace(61, 64, "var")
				.replace(65, 66, "a$2")
				.replace(81, 82, "a$2")
				.replace(71, 75, "a3")
				.wrap(76, 83, "(", ").a3")
			;

			result = alter.apply();
			expect(result).toEqual(expectedResult);

			alter = new StringAlter(string);
			alter
				.replace(1, 4, "var")
				.replace(9, 12, "var")
				.replace(13, 14, "a$0")
				.replace(29, 30, "a$0")
				.replace(19, 23, "a1")
				.insert(24, "(")
				.insert(31, ").a1")
				.replace(35, 38, "var")
				.replace(39, 40, "a$1")
				.replace(55, 56, "a$1")
				.replace(45, 49, "a2")
				.insert(50, "(")
				.insert(57, ").a2")
				.replace(61, 64, "var")
				.replace(65, 66, "a$2")
				.replace(81, 82, "a$2")
				.replace(71, 75, "a3")
				.insert(76, "(")
				.insert(83, ").a3")
			;

			result = alter.apply();
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


	describe("__ NEW FEATURES __", function() {
		describe("new apply sequence logic", function() {
			it("inner changes before get", function() {
				var string =
						'function test0(y = 1, [{x}, {z}] = [{x: 2}, {z: 3}]) {\n\r'
							+ '\n\r'
							+ '}\n\r'
					;
				var expectedResult =
						'function test0() {var y = arguments[0];if(y === void 0)y = 1;var x = (z = (arguments[1] !== void 0 ? arguments[1] : [{x: 2}, {z: 3}]))[0].x, z = (z[1]).z;\n\r'
							+ '\n\r'
							+ '}\n\r'
					;
				var alter = new StringAlter(string);
				alter
					.insert(25, ": x")	//inner changes
					.insert(30, ": z")	//inner changes
					.remove(15, 20)
					.remove(20, 51)//group for inner changes
					.insert(54			//get
						, 'var y = arguments[0];if(y === void 0)y = ' + alter.get(19, 20) + ';var x = (z = (arguments[1] !== void 0 ? arguments[1] : ' + alter.get(35, 51) + '))[0].x, z = (z[1]).z;'
						, {__newTransitionalSubLogic: true}
					)
				;
				var result = alter.apply();
				expect(result).toEqual(expectedResult);
			});

			it("inner inner changes before get 1", function() {
				var string =
					'function test0(y = 1, [{x}, {z}] = (()=>[{x: 2}, {z: 3}])()) {\n\r'
					+ '\n\r'
					+ '}\n\r'
				;
				var expectedResult =
					'function test0() {var y = arguments[0];if(y === void 0)y = 1;var x = (z = (arguments[1] !== void 0 ? arguments[1] : (function(){return [{x: 2}, {z: 3}]})()))[0].x, z = (z[1]).z;\n\r'
					+ '\n\r'
					+ '}\n\r'
				;
				var alter = new StringAlter(string);
				alter
					.insert(25, ": x")	//inner changes
					.insert(30, ": z")	//inner changes

					.remove(15, 20)
					.remove(20, 59)//group for inner changes
					.insert(62			//get
						, 'var y = arguments[0];if(y === void 0)y = ' + alter.get(19, 20) + ';var x = (z = (arguments[1] !== void 0 ? arguments[1] : ' + alter.get(35, 59) + '))[0].x, z = (z[1]).z;'
						, {__newTransitionalSubLogic: true}
					)

					.insert(36, "function")
					.remove(38, 40, "")
					.insertBefore(40, "{", {extend: true})
					.insert(56, "}", {extend: true})
					.insert(40, "return ")
				;
				var result = alter.apply();
				expect(result).toEqual(expectedResult);
			});

			it("inner inner changes before get 2", function() {
				var string =
					'{\n\r'
					+ '\tlet a = [...(function(a = 2){  })()];\n\r'
					+ '}\n\r'
				;
				var expectedResult =
					'function ITER$0(v,f){if(v){if(Array.isArray(v))return f?v.slice():v;if(typeof v===\'object\'&&typeof v[\'iterator\']===\'function\')return Array[\'from\'](v);}throw new Error(v+\' is not iterable\')};{\n\r'
					+ '\tvar a = [].concat(ITER$0((function(){var a = arguments[0];if(a === void 0)a = 2;  })()));\n\r'
					+ '}\n\r'
				;


				var alter = new StringAlter(string);
				alter
					.replace(4, 7, "var")
					.remove(26, 31)
					.insert(33, "var a = arguments[0];if(a === void 0)a = " + alter.get(30, 31) + ";", { __newTransitionalSubLogic: true })
					.insertBefore(0, "function ITER$0(v,f){if(v){if(Array.isArray(v))return f?v.slice():v;if(typeof v===\'object\'&&typeof v[\'iterator\']===\'function\')return Array[\'from\'](v);}throw new Error(v+\' is not iterable\')};")
					.replace(12, 40, "[].concat(ITER$0(" + alter.get(16, 39) + "))")

				;
				var result = alter.apply();
				expect(result).toEqual(expectedResult);
			});

			it("inner inner changes before get 3", function() {
				var string =
					'"use strict";'
					+ '\n\r'
					+ '\n\rfunction test1(a, b    , c    ) {'
					+ '\n\r'
					+ '\n\r}'
					+ '\n\r//test1(1);'
					+ '\n\r'
					+ '\n\rfunction test2(a/*, {b: {c}} = {b: {c: 321}}*/) {'
					+ '\n\r'
					+ '\n\r}'
					+ '\n\r//test2(1);'
					+ '\n\r'
					+ '\n\rfunction test4(a    , b /*= 44444456, c = 1, ...rest*/) {'
					+ '\n\r'
					+ '\n\r}'
					+ '\n\r//test4(void 0, void 0, void 0, 9, 8, 7, 6, 5, 4);'
					+ '\n\r'
					+ '\n\rfunction test5(a , b/* = 444*/, test = (function({A}){ return  {test: A} })({A: [1]})) {'
					+ '\n\r'
					+ '\n\r}'
					+ '\n\r//test5(void 0, void 0, void 0, 9, 8, 7, 6, 5, 4);'
					+ '\n\r'
				;
				var expectedResult =
					'"use strict";'
					+ '\n\r'
					+ '\n\rfunction test1(a, b    , c    ) {'
					+ '\n\r'
					+ '\n\r}'
					+ '\n\r//test1(1);'
					+ '\n\r'
					+ '\n\rfunction test2(a/*, {b: {c}} = {b: {c: 321}}*/) {'
					+ '\n\r'
					+ '\n\r}'
					+ '\n\r//test2(1);'
					+ '\n\r'
					+ '\n\rfunction test4(a    , b /*= 44444456, c = 1, ...rest*/) {'
					+ '\n\r'
					+ '\n\r}'
					+ '\n\r//test4(void 0, void 0, void 0, 9, 8, 7, 6, 5, 4);'
					+ '\n\r'
					+ '\n\rfunction test5(a , b) {var test = arguments[2];if(test === void 0)test = (function($D$0){var A = $D$0.A; return  {test: A} })({A: [1]});'
					+ '\n\r'
					+ '\n\r}'
					+ '\n\r//test5(void 0, void 0, void 0, 9, 8, 7, 6, 5, 4);'
					+ '\n\r'
				;


				var alter = new StringAlter(string);
				alter
					.insert(312, ": A")
					.remove(281, 346)
					.insert(349, "var test = arguments[2];if(test === void 0)test = " + alter.get(300, 346) + ";", { __newTransitionalSubLogic: true })
					.replace(310, 313, "$D$0")
					.insert(315, "var A = $D$0.A;", { __newTransitionalSubLogic: true })

				;
				var result = alter.apply();
				expect(result).toEqual(expectedResult);
			});

			it("inner inner changes before get 4", function() {
				var string =
					'"use strict";'
					+ '\n\r'
					+ '\n\rfunction test1(/*------------------*/) {'
					+ '\n\r//	console.log(a === 1, typeof b === "object" && b.c === 1, c === 1);'
					+ '\n\r}'
					+ '\n\r//test1()'
					+ '\n\r'
					+ '\n\rfunction test2(/*-----------------------*/) {'
					+ '\n\r//	console.log(a === 1, c === 321);'
					+ '\n\r}'
					+ '\n\r//test2()'
					+ '\n\r'
					+ '\n\rfunction test3(/*----------------------------------------------------------*/) {'
					+ '\n\r'
					+ '\n\r'
					+ '\n\r	{'
					+ '\n\r		var c = [{test: "test1"}, {test: "test2"}];'
					+ '\n\r		c.forEach(function inner(test  , index, thisArray) {'
					+ '\n\r'
					+ '\n\r		})'
					+ '\n\r	}'
					+ '\n\r}'
					+ '\n\rtest3();'
					+ '\n\r'
					+ '\n\rfunction test4(/*a, b = {c: 333}, {c: d}= b, ...rest*/)  {'
					+ '\n\r'
					+ '\n\r}'
					+ '\n\r//test4(void 0, void 0, void 0, 9, 8, 7, 6, 5,4)'
					+ '\n\r'
					+ '\n\rfunction test5(a/*=1*/,b/*={c: 333}*/,test = (function( A )(/*----------------*/{test: A} ))({A: [1      ]})) {'
					+ '\n\r'
					+ '\n\r}'
					+ '\n\rtest5(/*------------------------------------*/);'
					+ '\n\r'
				;
				var expectedResult =
					'"use strict";'
					+ '\n\r'
					+ '\n\rfunction test1(/*------------------*/) {'
					+ '\n\r//	console.log(a === 1, typeof b === "object" && b.c === 1, c === 1);'
					+ '\n\r}'
					+ '\n\r//test1()'
					+ '\n\r'
					+ '\n\rfunction test2(/*-----------------------*/) {'
					+ '\n\r//	console.log(a === 1, c === 321);'
					+ '\n\r}'
					+ '\n\r//test2()'
					+ '\n\r'
					+ '\n\rfunction test3(/*----------------------------------------------------------*/) {'
					+ '\n\r'
					+ '\n\r'
					+ '\n\r	{'
					+ '\n\r		var c = [{test: "test1"}, {test: "test2"}];'
					+ '\n\r		c.forEach(function inner(test  , index, thisArray) {'
					+ '\n\r'
					+ '\n\r		})'
					+ '\n\r	}'
					+ '\n\r}'
					+ '\n\rtest3();'
					+ '\n\r'
					+ '\n\rfunction test4(/*a, b = {c: 333}, {c: d}= b, ...rest*/)  {'
					+ '\n\r'
					+ '\n\r}'
					+ '\n\r//test4(void 0, void 0, void 0, 9, 8, 7, 6, 5,4)'
					+ '\n\r'
					+ '\n\rfunction test5(a/*=1*/,b) {var test = arguments[2];if(test === void 0)test = (function( A )/*----------------*/{return {test: A}}}  )({A: [1      ]});'
					+ '\n\r'
					+ '\n\r}'
					+ '\n\rtest5(/*------------------------------------*/);'
					+ '\n\r'
				;

				var alter = new StringAlter(string);
				alter
					.remove(607, 691)
					.insert(694, "var test = arguments[2];if(test === void 0)test = " + alter.get(628, 691) + ";", { __newTransitionalSubLogic: true })
					.replace(
						640
						, 663
						, alter.get(640, 663)
						, {
							transformUniq: 1
							, transform: function(str) {
								return str.replace(/\(/gi, "");
							}
						}
					)
					.insertBefore(663, "{", { extend: true })
					.insert(672, "}", { extend: true })
					.replace(
						672
						, 674
						, alter.get(672, 674)
						, {
							transformUniq: 2
							, transform: function(str) {
								return str.replace(/\)/gi, " ");
							}
						}
					)
					.insert(663, "return ", { __newTransitionalSubLogic: true })
				;
				var result = alter.apply();
				expect(result).toEqual(expectedResult);
			});

			it("inner inner changes before get 5", function() {
				var string =
					'const {b} = (function(...args){return ({b: args[1]})})(...[,1]);'
				;
				var expectedResult =
					'function ITER$0(v,f){if(v){if(Array.isArray(v))return f?v.slice():v;if(typeof v===\'object\'&&typeof v[\'iterator\']===\'function\')return Array[\'from\'](v);}throw new Error(v+\' is not iterable\')};var b = ((function(){var SLICE$0 = Array.prototype.slice;var args = SLICE$0.call(arguments, 0);return ({b: args[1]})}).apply(null, ITER$0([,1]))).b;'
				;


				var alter = new StringAlter(string);
				alter
					.replace(0, 5, "var")
					.insertBefore(31, "var SLICE$0 = Array.prototype.slice;")
					.remove(22, 29)
					.insert(31, "var args = SLICE$0.call(arguments, 0);", { __newTransitionalSubLogic: true })
					.insertBefore(0, 'function ITER$0(v,f){if(v){if(Array.isArray(v))return f?v.slice():v;if(typeof v===\'object\'&&typeof v[\'iterator\']===\'function\')return Array[\'from\'](v);}throw new Error(v+\' is not iterable\')};')
					.replace(12, 63, "(" + alter.get(13, 53) + ").apply(null, ITER$0(" + alter.get(58, 62) + "))")
					.replace(6,  63, "b = (" + alter.get(12, 63) + ").b")

				;
				var result = alter.apply();
				expect(result).toEqual(expectedResult);
			});
		});
	});




	// TODO:: implement Exceptions
//	describe("Exceptions", function() {
//		describe("get / string after", function() {
//			it("inner (code)", function() {
//				var string = "\n\r" +
//					"{\n\r" +
//					"	let arr\n\r" +
//					"}\n\r" +
//					"\n\r" +
//					"{\n\r" +
//					"	var output = [];\n\r" +
//					"	let arr = [1, 2, 3];\n\r" +
//					"	for(var f of arr ) {\n\r" +
//					"		output.push(f)\n\r" +
//					"	};\n\r" +
//					"}\n\r" +
//					";"
//				;
//				var alter = new StringAlter(string);
//				alter
//					.replace(6, 9, "var")
//					.replace(43, 46, "var")
//					.replace(47, 50, "arr$0")
//					.replace(79, 82, "arr$0")// ERROR#1 !! @link ERROR#2
//					.insert(0, 'function GET_ITER$0(v){if(v){if(Array.isArray(v))return 0;if(typeof v===\'object\'&&typeof v[\'iterator\']===\'function\')return v[\'iterator\']();}throw new Error(v+\' is not iterable\')};')
//					.insert(0, "var $D$0;")
//					.insert(0, "var $D$1;")
//					.insert(0, "var $D$2;")
//					.insert(66,
//					"var "
//						+ alter.get(74, 75)
//						+ ";$D$0 = GET_ITER$0("
//						+ alter.get(79, 82)
//						+ ");$D$1 = $D$0 === 0;$D$2 = ($D$1 ? "
//						+ alter.get(79, 82)
//						+ ".length : void 0);"
//					, { extend: true, applyChanges: true }
//				)
//					.replace(76, 82			// ERROR#2 !! Substring 79,82 is already mark to modify @link ERROR#1
// 						, "; $D$1 ? ($D$0 < $D$2) : !($D$2 = $D$0[\"next\"]())[\"done\"]; ")
//					.insertBefore(86, "f = ($D$1 ? " + alter.get(79, 82) + "[$D$0++] : $D$2[\"value\"]);")
//					.insertAfter(109, ";$D$0 = $D$1 = $D$2 = void 0;", { extend: true })
//				;
//
//				var result = alter.apply();
//				expect(result).toThrow("<TODO: message>");
//			});
//		});
//	});
});

















