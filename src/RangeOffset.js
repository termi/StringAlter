/*global module*/
/*es6-transpiler has-iterators:false, has-generators:false*/
"use strict";

class RangeOffset {
	constructor(offsets = []) {
		this.offsets = offsets;
	}

	addInsert(to, offset) {
		this.addRange(to, to, offset, true);
	}

	addRemove(from, to) {
		while( from++ < to ) {
			this.addRange(void 0, from, -1);
		}
	}

	addRange(from, to, offset, newIsAdding = false) {
		if( !offset ) {
			return;
		}

		if( offset < 0 ) {
			// TODO:: new logic [START]
//			if( offset < -1 ) {
//				this.addRemove(to + offset, to);
//				return;
//			}
//
//			from = to;
			// TODO:: new logic [END]

			// this is an old logic:
			from = from + (-offset - 1);
		}


		let {offsets} = this;

		let offsetValue = offsets[from] || 0
			, addingValue = 0
			, extendValue = 0
		;

		if( typeof offsetValue === "string" ) {
			let index = offsetValue.indexOf("|");
			if( index !== -1 ) {//adding
				addingValue = offsetValue.substr(index + 1) | 0;
				extendValue = offsetValue.substr(0, index) | 0;
			}
			else {
				extendValue = offsetValue | 0;
			}
		}
		else {
			extendValue = offsetValue | 0;
		}

		if( newIsAdding ) {
			addingValue += offset;
		}
		else {
			extendValue += offset;
		}

		if( addingValue ) {
			extendValue = `${extendValue}|${addingValue}`;
		}
		else {
			extendValue = extendValue;
		}

		offsets[from] = extendValue;
	}

	clone() {
		return new RangeOffset(this.offsets.slice())
	}

	/**
	 *
	 * @param pos
	 * @param {Array=} offsets
	 * @returns {*}
	 */
	getPosition(pos) {
		return this.getRange(pos, pos, true).from;
	}

	getRecord({from, to}, considerExtends) {
		return this.getRange(from, to, considerExtends);
	}

	getRange(from, to, considerExtends = false) {//TODO:: optimize function speed
		let {offsets} = this;

		if( offsets.length ) {
			let positionOffset = 0;
			let originalFrom = from + positionOffset, originalTo = to + positionOffset;

			for( let offset in offsets ) if( offsets.hasOwnProperty(offset) ) {
				// Fast enumeration through sparse array MAY CAUSE PROBLEM WITH WRONG ORDER OF ARRAY ITEM, but it is unlikely
				offset = offset | 0;

				let offsetValue = offsets[offset];
				let extendValue = 0;
				let addingValue = 0;

				if( typeof offsetValue === "string" ) {
					offsetValue += "";
					let index = offsetValue.indexOf("|");
					if( index !== -1 ) {//adding
						addingValue = offsetValue.substr(index + 1) | 0;
						extendValue = offsetValue.substr(0, index) | 0;
					}
					else {
						extendValue = offsetValue | 0;
					}
				}
				else {
					extendValue = offsetValue | 0;
				}

				if( offset <= originalTo ) {// must be <=
					if( offset <= originalFrom) {// must be <=
						if( considerExtends || offset !== originalFrom ) {
							from += extendValue;
						}
						if( addingValue ) {
							from += addingValue;
						}
					}

					to += extendValue;
					if( offset !== originalTo && addingValue ) {
						to += addingValue;
					}

				}
				else {
					break;
				}
			}
		}

		return {from, to};
	}
}

module.exports = RangeOffset;
