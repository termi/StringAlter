describe('alter', function() {
	"use strict";

	beforeEach(function() {
		stringAlter.reset();
	});


	it("simple", function() {
		expect(stringAlter.alter("0123456789", [
			{start: 1, end: 3, str: "first"},
			{start: 5, end: 9, str: "second"},
		])).toEqual("0first34second9");
	});

	it("not-sorted-order", function() {
		expect(stringAlter.alter("0123456789", [
			{start: 5, end: 9, str: "second"},
			{start: 1, end: 3, str: "first"},
		])).toEqual("0first34second9");
	});

	it("insert", function() {
		expect(stringAlter.alter("0123456789", [
			{start: 5, end: 5, str: "xyz"},
		])).toEqual("01234xyz56789");
	});

	it("delete", function() {
		expect(stringAlter.alter("0123456789", [
			{start: 5, end: 6, str: ""},
		])).toEqual("012346789");
	});

	it("nop1", function() {
		expect(stringAlter.alter("0123456789", [])).toEqual("0123456789");
	});

	it("nop2", function() {
		expect(stringAlter.alter("0123456789", [
			{start: 5, end: 5, str: ""},
		])).toEqual("0123456789");
	});

	it("simple tokens", function() {
		var source = "12345 67890";
		var fragments = [
			{start: 5, end: 6, str: "|" + stringAlter.getFromToString(6, 11) + "|"}
		];
		var result = "12345|67890|67890";

		expect(stringAlter.alter(source, fragments)).toEqual(result);
	});

	it("interchanging", function() {
		var source = "[ x1 ] <-> [ x2 ]";
		var fragments = [
			{start: 13, end: 15, str: stringAlter.getFromToString(2, 4)}
			, {start: 2, end: 4, str: stringAlter.getFromToString(13, 15)}
		];
		var result = "[ x2 ] <-> [ x1 ]";

		expect(stringAlter.alter(source, fragments)).toEqual(result);
	});

	it("inner", function() {
		var source = "[ ( [ x2 ] <-> [ x3 ] ) ]";
		var fragments = [
			{start: 6, end: 8, str: stringAlter.getFromToString(17, 19)}
			, {start: 17, end: 19, str: stringAlter.getFromToString(6, 8)}
			, {start: 0, end: 25, str: "((" + stringAlter.getFromToString(0, 25) + "))"}
		];
		var result = "(([ ( [ x3 ] <-> [ x2 ] ) ]))";

		expect(stringAlter.alter(source, fragments)).toEqual(result);
	});

	it("inner inner", function() {
		var source = "[ ( [ x2 ] <-> [ x3 ] ) ]";
		var fragments = [
			{start: 6, end: 8, str: stringAlter.getFromToString(17, 19)}
			, {start: 17, end: 19, str: stringAlter.getFromToString(6, 8)}
			, {start: 0, end: 25, str: "((" + stringAlter.getFromToString(0, 25) + "))"}
			, {start: 0, end: 25, str: "{" + stringAlter.getFromToString(0, 25) + "}"}
		];
		var result = "{(([ ( [ x3 ] <-> [ x2 ] ) ]))}";

		expect(stringAlter.alter(source, fragments)).toEqual(result);
	});

	it("inner inner with adding", function() {
		var source = "[ ( [ x2 ] <-> [ x3 ] ) ]";
		var fragments = [
			{start: 6, end: 8, str: stringAlter.getFromToString(17, 19)}
			, {start: 17, end: 19, str: stringAlter.getFromToString(6, 8)}
			, {start: 0, end: 0, str: "--"}
			, {start: 25, end: 25, str: "--"}
			, {start: 0, end: 25, str: "((" + stringAlter.getFromToString(0, 25) + "))"}
			, {start: 0, end: 25, str: "{" + stringAlter.getFromToString(0, 25) + "}"}
		];
		var result = "--{(([ ( [ x3 ] <-> [ x2 ] ) ]))}--";

		expect(stringAlter.alter(source, fragments)).toEqual(result);
	});

	it("inner inner with extended adding", function() {
		var source = "[ ( [ x2 ] <-> [ x3 ] ) ]";
		var fragments = [
			{start: 6, end: 8, str: stringAlter.getFromToString(17, 19)}
			, {start: 17, end: 19, str: stringAlter.getFromToString(6, 8)}
			, {start: 0, end: 0, str: "--", extend: true}
			, {start: 25, end: 25, str: "--", extend: true}
			, {start: 0, end: 25, str: "((" + stringAlter.getFromToString(0, 25) + "))"}
			, {start: 0, end: 25, str: "{" + stringAlter.getFromToString(0, 25) + "}"}
		];
		var result = "{((--[ ( [ x3 ] <-> [ x2 ] ) ]--))}";

		expect(stringAlter.alter(source, fragments)).toEqual(result);
	});

	it("inner inner inner", function() {
		var source = "[ ( [ x2 ] <-> [ x3 ] ) ]";
		var fragments = [
			{start: 6, end: 8, str: stringAlter.getFromToString(17, 19)}
			, {start: 17, end: 19, str: stringAlter.getFromToString(6, 8)}
			, {start: 0, end: 25, str: "((" + stringAlter.getFromToString(0, 25) + "))"}
			, {start: 0, end: 25, str: "{" + stringAlter.getFromToString(0, 25) + "}"}
			, {start: 0, end: 25, str: "<" + stringAlter.getFromToString(0, 25) + ">"}
		];
		var result = "<{(([ ( [ x3 ] <-> [ x2 ] ) ]))}>";

		expect(stringAlter.alter(source, fragments)).toEqual(result);
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
