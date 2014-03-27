describe('invalid using of StringAlter', function() {
	"use strict";

	describe('cross changes', function() {
		it(" -- ", function() {
			var string = "var a = [1], c = [0, ...[...a], ...a], d = [0, ...[...a], ...a];";
			var alter = new StringAlter(string);
			alter
				.insert(0, "ITER$0(v){return v};", {"before":true})

				.remove(21, 25)
				.remove(29, 30)
				.replace(19, 28, "].concat(ITER$0(")
				.insert(29, ")")
				.replace(29, 35, ", ITER$0(")
				.insert(36, ")")
				.replace(36, 37, ")", {"extend":true})

				.remove(47, 51)
				.remove(55, 56)
				.replace(45, 54, "].concat(ITER$0(")
				.insert(55, ")")
				.replace(55, 61, ", ITER$0(")
				.insert(62, ")")
				.replace(62, 63, ")", {"extend":true})
			;

			var result = alter.apply();
			expect(result).toEqual("ITER$0(v){return v};var a = [1], c = [0].concat(ITER$0(a)), ITER$0(a));");
		});

		var a = [1], c = [0, ...[...a], ...a], d = [0, ...[...a], ...a];

	})

});
