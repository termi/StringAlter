/*global module*/
/*es6-transpiler has-iterators:false, has-generators:false*/
"use strict";

class Record {
	constructor(from, to) {
		this.from = from;
		this.to = to;
	}

	toString() {
		return `${Record.uniqueStart}[${this.from}]${Record.uniqueSeparator}[${this.to}]${Record.uniqueEnd}`;
	}

	addSubs(...fragments) {
		if( fragments.length ) {
			if( !this.subs ) {
				this.subs = [];
			}
			this.subs.push(...fragments);
		}
	}

	getSubs() {
		return this.subs;
	}
}
Record.uniqueStart = "[<" + ((Math.random() * 1e8) | 0);//should matches /\[\<\d{8}/
Record.uniqueSeparator = "" + ((Math.random() * 1e8) | 0);//should matches /\d{8}/
Record.uniqueEnd = ((Math.random() * 1e8) | 0) + ">]";//should matches /\d{8}\>\]/
Record.uniqueRE = new RegExp("\\[\\<\\d{" + (Record.uniqueStart.length - 2) + "}\\[(\\d+)\\]\\d{" + Record.uniqueSeparator.length + "}\\[(\\d+)\\]\\d{" + (Record.uniqueEnd.length - 2) + "}\\>\\]", "g");

module.exports = Record;
