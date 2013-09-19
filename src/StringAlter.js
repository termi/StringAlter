"use strict";

var assert = this["assert"] || function(expect, msg) {
	if( expect != true ) {
		throw new Error(msg || "");
	}
};

class Record {
	constructor(from, to) {
		this.from = from;
		this.to = to;
	}

	toString() {
		return Record.uniqueStart + "[" + this.from + "]" + Record.uniqueSeparator + "[" + this.to + "]" + Record.uniqueEnd;
	}
}
Record.uniqueStart = "[<" + ((Math.random() * 1e8) | 0);//should matches /\[\<\d{8}/
Record.uniqueSeparator = "" + ((Math.random() * 1e8) | 0);//should matches /\d{8}/
Record.uniqueEnd = ((Math.random() * 1e8) | 0) + ">]";//should matches /\d{8}\>\]/
Record.uniqueRE = new RegExp("\\[\\<\\d{" + (Record.uniqueStart.length - 2) + "}\\[(\\d+)\\]\\d{" + Record.uniqueSeparator.length + "}\\[(\\d+)\\]\\d{" + (Record.uniqueEnd.length - 2) + "}\\>\\]", "g");

class Fragment {
	constructor(from, to, insertStr = "", type = Fragment.Types.replace) {
		this.record = new Record(from, to);
		this.str = insertStr;
		this.type = type;
	}
	
	sub(fragment) {
		if( fragment instanceof Fragment ) {
			if( !this.subs ) {
				this.subs = [];
			}
			this.subs.unshift(fragment);
			
			return null;
		}
		else {
			return this.subs;
		}
	}
}
Fragment.Types = {replace: 1, insert: 2, remove: 3 };

class StringAlter {
	constructor(source, fragments = [], offsets = []) {
		this._source = source;
		this._fragments = fragments;
		this._offsets = offsets;

		this._fragmentsGroupId = 0;
	}

	_createFragment(from, to, data, type, options) {
		if( typeof data === "object" ) {
			assert(data instanceof Record);
		}
		else if(typeof data === "string") {
			
		}
		else {
			assert(false, "createFragment without fragment data")
		}

		let fragment = new Fragment(from, to, data + "", type);

		if( options ) {
			fragment.options = options;
		}

		this._fragments.push(fragment);
	}

	reset() {
		this._fragments = [];
		this._offsets = [];
	}

	hasChanges() {
		return !!this._fragments.length;
	}

	/**
	 *
	 * @param from
	 * @param to
	 * @returns {Record}
	 */
	get(from, to) {
		return new Record(from, to);
	}

	/**
	 *
	 * @param to
	 * @param data
	 * @param {Object=} options
	 * @returns {StringAlter}
	 */
	insert(to, data, options) {
		this._createFragment(to, to, data, Fragment.Types.insert, options);
		return this;
	}

	/**
	 * TODO: tests
	 * @param to
	 * @param data
	 * @param {Object=} options
	 * @returns {StringAlter}
	 */
	insertAfter(to, data, options = {}) {
		options.after = true;
		return this.insert(to, data, options);
	}

	/**
	 * TODO: tests
	 * @param to
	 * @param data
	 * @param {Object=} options
	 * @returns {StringAlter}
	 */
	insertBefore(to, data, options = {}) {
		options.before = true;
		return this.insert(to, data, options);
	}

	/**
	 *
	 * @param from
	 * @param to
	 * @param {Object=} options
	 * @returns {StringAlter}
	 */
	remove(from, to, options) {
		this._createFragment(from, to, "", Fragment.Types.remove, options);
		return this;
	}

	/**
	 * TODO: tests
	 * @param srcFrom
	 * @param srcTo
	 * @param destination
	 * @param {Object=} options
	 * @returns {StringAlter}
	 */
	move(srcFrom, srcTo, destination, options) {
		this.remove(srcFrom, srcTo);
		this.insert(destination, this.get(srcFrom, srcTo), options);
		return this;
	}

	/**
	 *
	 * @param from
	 * @param to
	 * @param data
	 * @param {Object=} options
	 * @returns {StringAlter}
	 */
	replace(from, to, data, options) {
		if( from == to ) {
			return this.insert(from, data, options);
		}
		else {
			this._createFragment(from, to, data, Fragment.Types.replace, options);
		}
		return this;
	}

	/**
	 *
	 * @param from
	 * @param to
	 * @param start
	 * @param end
	 * @param {Object=} options
	 * @returns {StringAlter}
	 */
	wrap(from, to, start, end, options = {}) {
		options.group = ++this._fragmentsGroupId;

		let firstInsertOptions = Object.create(options);
		firstInsertOptions.reverse = true;

		this.insert(from, start, firstInsertOptions);//TODO::insertBefore
		this.insert(to, end, options);//TODO::insertAfter
		return this;
	}


	/**
	 *
	 * @param pos
	 * @param offsets
	 * @returns {*}
	 */
	updatePosition(pos, offsets) {
		if( !offsets.length ) {
			return pos;
		}
		return this.updateRecord({from: pos, to: pos}, offsets).from;
	}
	
	updateRecord({from, to}, offsets = this._offsets) {
		if( offsets && offsets.length ) {
			let positionOffset = 0;
			let originalFrom = from + positionOffset, originalTo = to + positionOffset;

			for( let offset in offsets ) if( offsets.hasOwnProperty(offset) ) {
				// Fast enumeration through array MAY CAUSE PROBLEM WITH WRONG ORDER OF ARRAY ITEM, but it is unlikely
				offset = offset | 0;

				let offsetValue = offsets[offset];
				let extendValue = offsetValue | 0;
				let addingValue;

				if( offsetValue > extendValue ) {
					offsetValue += "";
					let index = offsetValue.indexOf(".");
					if( index !== -1 ) {//adding
						addingValue = +(offsetValue.substr(index + 1));
					}
				}

				if( offset <= originalTo ) {// must be <=
					if( offset <= originalFrom) {// must be <=
						if( offset !== originalFrom ) {
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

		return new Record(from, to);
	}

	apply() {
		let offsets = this._offsets;
		let fragments = this._fragments;
		let sourceString = this._source;

		if( fragments.length && fragments[0].originalIndex === void 0 ) {
			let fragmentsGroups = Object.create(null);
			for( let index = 0, fragmentsLength = fragments.length - 1 ; index < fragmentsLength ;  index++ ) {
				let frag = fragments[index];

				let fragmentOptions = frag.options || {};

				if( fragmentOptions["inactive"] === true ) {//TODO: tests
					fragments.splice(index, 1);
					index--;
					fragmentsLength--;

					continue;
				}

				let {group} = fragmentOptions;

				if( group ) {
					let prev = index ? fragments[index - 1] : {options: {priority : 1}};

					if( fragmentsGroups[group] !== void 0 ) {
						delete fragmentsGroups[group];
						fragmentOptions.priority = (fragmentOptions.priority || 0) + (fragmentOptions.priority || 0) + 1;
					}
					else {
						fragmentsGroups[group] = null;
						fragmentOptions.priority = (fragmentOptions.priority || 0) - (fragmentOptions.priority || 0) - 1;
					}
				}

				frag.originalIndex = index;
			}

			fragments.sort(function(a, b) {// TODO:: needs to be rewritten

				let {from: aStart, to: aEnd} = a.record;
				let {from: bStart, to: bEnd} = b.record;
				let result = aStart - bStart;

				if( result === 0 ) {
					let {reverse: aReverse, priority: aPriority, extend: aExtend, before: aBefore, after: aAfter} = (a.options || {});
					let {reverse: bReverse, priority: bPriority, extend: bExtend, before: bBefore, after: bAfter} = (b.options || {});

					if( aBefore === true || bBefore === true ) {
						if( aBefore === bBefore ) {
							return (a.originalIndex - b.originalIndex);
						}
						return bBefore ? 1 : -1;
					}
					if( bAfter === true || bAfter === true ){
						if( bAfter === aAfter ) {
							return (a.originalIndex - b.originalIndex);
						}
						return bAfter ? -1 : 1;
					}

					if( aReverse === true || bReverse === true ) {//TODO:: replace reverse with before
						if( aStart === aEnd && bStart === bEnd ) {
							if( aReverse === bReverse ) {
								result = -1;
//								result = 1;
							}
							else {
								return aReverse ? -1 : 1
							}
						}
					}

					result = result * (a.originalIndex - b.originalIndex)
//						TODO:: * (aExtend ? -1 : 1) * (bExtend ? -1 : 1)
					;

					if( aPriority === bPriority ) {

					}
					else if( aPriority !== void 0 || bPriority !== void 0 ) {
						aPriority = aPriority || 0;
						bPriority = bPriority || 0;
						if( aPriority <= bPriority ) {
							if( result > 0 === !!aExtend ) {
								result = result * -1;
							}
						}
						else {
							if( result < 0 === !!aExtend ) {
								result = result * -1;
							}
						}
					}
				}
				else {
					result = 0;
				}

				if( result === 0 ) {
					result = aEnd - bEnd;
				}

				return (result === 0 ? ( (result = aStart - bStart) === 0 ? a.originalIndex - b.originalIndex : result) : result);
			});
		}

		// create sub fragments
		let lastStart, lastEnd, groupFrag;
		for( let fragmentsLength = fragments.length - 1 ; fragmentsLength >= 0 ;  fragmentsLength-- ) {
			let frag = fragments[fragmentsLength];
			let {from: start, to: end} = frag.record;
			let groupFragExtend = groupFrag && groupFrag.type !== Fragment.Types.insert
				, currFragExtend = frag.type !== Fragment.Types.insert || (frag.options || {}).extend
			;

			if( lastEnd &&
				(
					start > lastStart && end < lastEnd
					|| (groupFragExtend && currFragExtend && (start === lastStart || end === lastEnd))
				)
			) {
				groupFrag.sub(frag);
				fragments.splice(fragmentsLength, 1);
			}
			else {
				lastStart = start;
				lastEnd = end;
				groupFrag = frag;
			}
		}

		let outsStr = "", outs = [];

		let pos = this.updatePosition(0, offsets)
			, clearPos = 0
			, posOffset = 0
		;

		if( pos !== 0 ) {
			outsStr = sourceString.slice(0, pos);
		}

		let currentOffsets = offsets.slice();

		for (let index = 0; index < fragments.length; index++) {
			let frag = fragments[index];

			let {from, to} = this.updateRecord(frag.record, currentOffsets);
			if( frag.type === Fragment.Types.insert ) {
				to = from;
			}

			assert(
				pos <= from
					|| from === to//nothing to remove
				, "'pos' (" + pos + ") shoulde be <= 'start' (" + from + ") or 'start' (" + from + ") == 'end' (" + to + ")"
			);
			assert(from <= to, "from (" + from + ") should be <= to (" + to + ")");

			let subFragments = frag.sub();
			if( subFragments ) {
				outsStr += outs.join("");

				let subAlter = new StringAlter(
					outsStr + sourceString.slice(pos, from) + sourceString.slice(from, to) + sourceString.substring(to)
					, subFragments
					, this._offsets
				);
				sourceString = subAlter.apply();

				let offsetPos = this.updatePosition(clearPos, offsets);

				pos = offsetPos;

				offsets = this._offsets;
				currentOffsets = this._offsets.slice();
				({from, to}) = this.updateRecord(frag.record, offsets);
				outs = [];
			}

			let string = frag.str.replace(Record.uniqueRE, (str, from, to) => {
				to |= 0;

				var newRecord = this.updateRecord(new Record(from | 0, to), currentOffsets);

				return sourceString.substring(newRecord.from, newRecord.to);
			});

			{
				let transform = (frag.options || {}).transform;
				if( typeof transform === "function" ) {
					string = transform.call(frag, string);
				}
			}


			let offset = string.length - ( to - from );
			if( offset ) {
				let newIsAdding = to === from
					, newIndex = frag.record.from
					, value = offsets[newIndex] || 0
					, insertingValue = value | 0
					, addingValue
				;

				value += "";
				let index = value.indexOf(".");
				if( index !== -1 ) {//adding
					addingValue = +(value.substr(index + 1));
				}
				else {
					addingValue = 0;
				}

				if( newIsAdding ) {
					addingValue += offset;
				}
				else {
					insertingValue += offset;
				}

				if( addingValue ) {
					value = (insertingValue + "." + addingValue);
				}
				else {
					value = insertingValue;
				}

				offsets[newIndex] = value;
			}

			if( pos !== from ) {
				outs.push(sourceString.slice(pos, from));
			}
			outs.push(string);

			pos = to;
			({to: clearPos}) = frag.record;
		}
		if (pos < sourceString.length) {
			outs.push(sourceString.slice(pos));
		}

		this.reset();

		return outsStr + outs.join("");
	}
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	module.exports = StringAlter;
}
