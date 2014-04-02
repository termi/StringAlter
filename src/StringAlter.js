"use strict";

const BUILD_VERSION = '%%BUILD_VERSION%%';

const RangeIndex = require('rangeindex');

let assert = this["assert"] || ((expect, msg) => { if(expect != true)throw new Error(msg || "") });
var assign = /*Object['assign'] || */(t, s) => {for(var p in s){if(s.hasOwnProperty(p)){t[p]=s[p];}}return t};

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

class Fragment {
	constructor(from, to, insertStr = "", type = Fragment.Types.replace) {
		this.record = new Record(from, to);
		this.type = type;

		this.data = insertStr;
		this.expressions = void 0;
	}
	
	addSubs(...fragments) {
		if( fragments.length ) {
			if( !this.subs ) {
				this.subs = [];
			}
			this.subs.unshift(...fragments);
		}
	}	

	getSubs() {
		return this.subs;
	}

	extractData(recordsCache) {
		if( this.extracted ) {
			if( this.expressions ) {
				return this.expressions.length;
			}
			return 0;
		}

		let { record: {from: fragmentFrom, to: fragmentTo} } = this;

		let data = this.data;
		let fragmentsLen;

		let minFrom = -1;
		let maxTo = -1;

		let isIsolate = true;

		if( data instanceof Record ) {
			this.expressions = [data];
			this.data = [];
			fragmentsLen = 1;
		}
		else {
			fragmentsLen = 0;
			let prevOffset = 0;
			let newData;

			data = data + "";

			data.replace(Record.uniqueRE, (str, from, to, offset) => {
				fragmentsLen++;

				from |= 0;
				to |= 0;

				if( !newData ) {//first found
					newData = [];
					this.expressions = [];
					minFrom = from;
					maxTo = to;
				}
				else {
					if( from < minFrom ) {
						minFrom = from;
					}
					if( to > maxTo ) {
						maxTo = to;
					}
				}

				if( isIsolate ) {
					if( from < fragmentFrom || to > fragmentTo ) {
						isIsolate = false;
					}
				}

				let recordKey = `${from}|${to}`;

				this.expressions.push(recordsCache[recordKey]);
				newData.push(data.substring(prevOffset, offset));

				prevOffset = offset + str.length;
			});

			if( newData ) {
				newData.push(data.substring(prevOffset));//tail
				this.data = newData;
			}
			else {
				this.data = data;
			}
		}

		this.isIsolate = isIsolate;
		this.minFrom = minFrom;
		this.maxTo = maxTo;
		this.extracted = true;

		return fragmentsLen;
	}

	setOptions(options) {
		if( !this.options )this.options = {};

		assign(this.options, options);
	}
}
Fragment.Types = {replace: 1, insert: 2, remove: 3, 1: 'replace', 2: 'insert', 3: 'remove'};

class StringAlter {
	constructor(source, options) {
		this.reset(
			new String(source)//TODO:: [new get logic] after new get logic completed replace it to this._source = source
			, options
		);
	}

	reset(source = '', {fragments = [], offsets = new RangeOffset(), records = {}, fragmentStatesArray = [], policy = {}} = {}) {
		if( this._fragments == fragments ) {
			// no needs to reindex
		}
		else {
			this._fragments = fragments;
			this._fragmentsIndex = new RangeIndex();

			if( fragments.length ) {
				// TODO:: this._fragmentsIndex.reset(); this._fragmentsIndex.rebuild(fragments);
			}
		}

		if( this._records == records ) {
			// no needs to reindex
		}
		else {
			this._records = records;
			this._getRecorsIndex = new RangeIndex();

			// TODO::
//			for( var isNotEmpty in records ) if( records.hasOwnProperty(isNotEmpty) ) {
//				this._fragmentsIndex.reset();
//				this._fragmentsIndex.rebuild(records);
//				break;
//			}
		}

		this._source = source;
		this._offsets = offsets;
		this._fragmentStates = {};
		this._fragmentStatesArray = fragmentStatesArray;
		this.__prevStateName = this.__currentStateName = void 0;//"$" + Math.random() * 1e9 | 0 + "$";
		this._fragmentsGroupId = 0;
		this._removedBlocks = {};

		this.policy = assign(assign({}, StringAlter.defaultPolicy), policy);
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

		from |= 0;
		to |= 0;

		let fragment = new Fragment(from, to, data + "", type);

		this.checkFragmentRange(fragment);

		if( options ) {
			fragment.options = options;
		}

		fragment.__createdIndex = this._fragments.length;
		this._fragments.push(fragment);
		this._fragmentsIndex.put(from, to, fragment);

//		if( options && options.__newTransitionalSubLogic ) {// Transitional period
			for( let record of this._getRecorsIndex.findOuter(from, to) ) {
				record.addSubs(fragment);
			}
//		}
	}

	hasChanges() {
		return !!(this._fragments.length || this._fragmentStatesArray.length);
	}

	/**
	 *
	 * @param {number} from
	 * @param {number} to
	 * @returns {Record}
	 */
	get(from, to) {
		assert(from <= to, `from(${from}) should be <= to(${to})`);

		let recordKey = from + "|" + to;
		if( this._records[recordKey] ) {
			return this._records[recordKey];
		}

		let record = this._records[recordKey] = new Record(from, to);

		this._getRecorsIndex.put(from, to, record);

		let recordFragments = this._fragmentsIndex.find(from, to).sort( ({__createdIndex: a}, {__createdIndex: b}) => (a - b) );

		if( recordFragments && recordFragments.length ) {
			// [new get logic]
			record.addSubs(...recordFragments);
		}
		record._source = this._source;//TODO:: [new get logic] after new get logic completed remove this line

		return record;
	}

	/**
	 *
	 * @param {number} from
	 * @param {number} to
	 * @returns {string}
	 */
	getRange(from, to) {
		assert(from <= to, `from(${from}) should be <= to(${to})`);
		
		return this._source.substring(from, to);
	}

	/**
	 *
	 * @returns {string}
	 */
	getSource() {
		return this._source;
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
		assert(srcFrom <= srcTo, `srcFrom(${srcFrom}) should be <= srcTo(${srcTo})`);

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

	/** @deprecated */
	setState(newStateName) {
		if( !this._fragmentStates[newStateName] ) {
			this._fragmentStatesArray.push(this._fragmentStates[newStateName] = []);
		}
		if( !this._fragmentStates[this.__currentStateName] ) {
			this._fragmentStates[this.__currentStateName] = this._fragments;
		}
		this.__prevStateName = this.__currentStateName;
		this.__currentStateName = newStateName;
		this._fragments = this._fragmentStates[newStateName];

		return this;
	}

	/** @deprecated */
	restoreState() {
		var frags = this._fragmentStates[this.__currentStateName = this.__prevStateName];
		if( frags ) {
			this._fragments = frags;
		}

		return this;
	}

	groupedFragments(fragments = this._fragments) {
		let lastStart, lastEnd, groupFrag, groupFragIndex;
		
		for( let fragmentsLength = fragments.length - 1 ; fragmentsLength >= 0 ;  fragmentsLength-- ) {
			let frag = fragments[fragmentsLength];
			let {from, to} = frag.record;
			let groupFragExtend = groupFrag && groupFrag.type !== Fragment.Types.insert
				, currFragExtend = frag.type !== Fragment.Types.insert || (frag.options || {}).extend
			;

			if( lastEnd
				&& (
					from > lastStart && to < lastEnd
					|| (groupFragExtend && currFragExtend && (from >= lastStart && to <= lastEnd))
				)
			) {
				groupFrag.addSubs(frag);
				fragments.splice(fragmentsLength, 1);
			}
			else if( lastEnd &&	(
					from < lastStart && to > lastEnd
					|| (groupFragExtend && currFragExtend && (from <= lastStart && to >= lastEnd)) )
			) {
				frag.addSubs(groupFrag);
				fragments.splice(groupFragIndex, 1);
				groupFrag = frag;
				lastStart = from;
				lastEnd = to;
			}
			else {
				lastStart = from;
				lastEnd = to;
				groupFrag = frag;
				groupFragIndex = fragmentsLength;
			}
		}
		return fragments;
	}

	apply(forcePreparation = false) {
		let offsets = this._offsets;
		let fragments = this._fragments;
		let sourceString = this._source;
		let fragmentsLength = fragments.length;
		let sourceStringLength = sourceString.length;
		
//		console.log(this.printFragments(fragments ).join("\n"), "\n-------------============stages============-------------\n", this._fragmentStatesArray.reduce(function(arr, fragments){ arr.push.apply(arr, this.printFragments(fragments));return arr }.bind(this), []).join("\n"))
//		console.log(fragments)

		if( fragmentsLength && (fragments[0].originalIndex === void 0 || forcePreparation === true) ) {
			let fragmentsGroups = Object.create(null);
			for( let index = 0 ; index < fragmentsLength ;  index++ ) {
				let frag = fragments[index];

				let {options: fragmentOptions = {}} = frag;

				if( fragmentOptions["inactive"] === true ) {//TODO: tests
					fragments.splice(index, 1);
					index--;
					fragmentsLength--;

					continue;
				}

				let {group} = fragmentOptions;

				if( group ) {
//					let prev = index ? fragments[index - 1] : {options: {priority : 1}};

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
					let { reverse: aReverse, priority: aPriority, extend: aExtend, before: aBefore, after: aAfter } = a.options || {};
					let { reverse: bReverse, priority: bPriority, extend: bExtend, before: bBefore, after: bAfter } = b.options || {};

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
		fragments = this.groupedFragments(fragments);
		fragmentsLength = fragments.length;

		let outsStr = "", outs = [];

		let pos = offsets.getPosition(0)
			, clearPos = 0
			//, posOffset = 0
		;

		if( pos !== 0 ) {
			if( pos < 0 ) pos = 0;// 'pos' can be < 0 (due offsets) - ignoring this case
			outsStr = sourceString.slice(0, pos);
		}

		let currentOffsets = offsets.clone();
		let postFragments = [];

		for (let index = 0; index < fragmentsLength; index++) {
			let frag = fragments[index];
			let {options: fragOptions = {}} = frag;

			if( typeof fragOptions.onbefore === "function" ) {
				let beforeOut = fragOptions.onbefore.call(frag, fragOptions, frag.data);
				if( beforeOut !== void 0 ) {
					frag.data = beforeOut;
				}
			}

			let expressionsLength = frag.extractData(this._records);

			let {from, to} = currentOffsets.getRecord(frag.record);
			if( frag.type === Fragment.Types.insert ) {
				to = from;
			}

			assert(
				pos <= from
					|| from === to//nothing to remove
				, `'pos' (${pos}) shoulde be <= 'start' (${from}) or 'start' (${from}) == 'end' (${to})`
			);
			assert(from <= to, `from (${from}) should be <= to (${to})`);

			if( fragOptions.applyChanges && expressionsLength ) {
				let anotherFrag;
				if(
					( frag.maxTo > frag.record.to && (anotherFrag = fragments[index + 1]) && anotherFrag.record.from < frag.maxTo )
					|| ( frag.minFrom < frag.record.from && (anotherFrag = fragments[index - 1]) && anotherFrag.record.to > frag.minFrom )
				) {
					postFragments.push(frag);
					continue;
				}
			}

			let subFragments = frag.getSubs();
			if( subFragments ) {
				outsStr += outs.join("");

				let subAlter = new StringAlter(
					outsStr + sourceString.slice(pos, from) + sourceString.slice(from, to) + sourceString.substring(to)
					, {fragments: subFragments, offsets: this._offsets, records: this._records, policy: this.policy}
				);
				sourceString = subAlter.apply();
				subAlter.reset();

				let offsetPos = offsets.getPosition(clearPos);

				pos = offsetPos;

				offsets = this._offsets;// TODO:: try to remove this

				currentOffsets = offsets.clone();

				({from, to}) = offsets.getRecord(frag.record);
				outs = [];
			}

			let string;
			if( fragOptions.__newTransitionalSubLogic && expressionsLength ) {// [new get logic]
				string = "";
				let data = frag.data
					, dataLength = data.length
				;
				for( let index = 0 ; index < expressionsLength ; index++ ) {
					if( dataLength ) {
						string += data[index];
					}

					let record = frag.expressions[index];

					if( record.__raw ) {
						string += record.__raw;
					}
					else {
						let sourceString = record._source.substring(record.from, record.to);//this._source.substring(record.from, record.to);
						let subFragments = record.getSubs();
						if( subFragments ) {
							let alter = new StringAlter(sourceString
								, {
									fragments: subFragments
									, offsets: new RangeOffset([-record.from])
									, policy: this.policy
								}
							);
							sourceString = alter.apply(true);
							alter.reset();
						}
						string += (record.__raw = sourceString);
					}
				}
				string += data[expressionsLength];
			}
			else if( expressionsLength ) {//old logic
				string = "";
				let data = frag.data
					, dataLength = data.length
				;
				for( let index = 0 ; index < expressionsLength ; index++ ) {
					if( dataLength ) {
						string += data[index];
					}
				
					let record = frag.expressions[index];
					record = currentOffsets.getRecord(record);
					string += sourceString.substring(record.from, record.to);
				}
				string += data[expressionsLength];
			}
			else {
				string = frag.data;
			}

			{
				let transform = fragOptions.transform;
				if( typeof transform === "function" ) {
					string = transform.call(frag, string);
				}
			}

			let offset = string.length - ( to - from );
			let newIsAdding = to === from && !fragOptions.extend;

			if( newIsAdding ) {
				offsets.addInsert(frag.record.from, offset);
			}
			else {
				offsets.addRange(frag.record.from, frag.record.to, offset);
			}

			if( pos !== from ) {
				outs.push(sourceString.slice(pos, from));
			}
			outs.push(string);

			pos = to;
			({ record: {to: clearPos} }) = frag;
		}
		if (pos < sourceString.length) {
			outs.push(sourceString.slice(pos));
		}

		sourceString = outsStr + outs.join("");

		this._fragmentStatesArray.unshift(postFragments);

		this.reset(sourceString, {offsets: this._offsets, fragmentStatesArray: this._fragmentStatesArray, policy: this.policy});

		while( postFragments = this._fragmentStatesArray.shift() ) {
			if( postFragments.length ) {
				this._fragments = postFragments;
				this.apply();
			}
		}

		return this._source;
	}
	
	toString() {
		return this._source;
	}

	printFragments(fragments = this._fragments) {
		let result = [];
		for( let frag of fragments ) {
			let {type, record} = frag, {remove, insert} = Fragment.Types;

			result.push(
				`${remove === type ? "REMOVE" : insert === type ? "INSERT" : "REPLACE"}:\t`
				+ `[${record.from}${insert !== type ? ", " + record.to : ""}]`
				+ `exp: ${(frag.expressions || []).length} | `
				+ `index: ${frag.__createdIndex} | `
				+ `opt: ${JSON.stringify(frag.options)}`
				+ `${remove !== type ? "\\n  data: '" + frag.data + "'" : ""} | `
			);
		}

		return result;
	}

	checkFragmentRange(fragment) {
		// TODO:: check methods 'move', 'replace', etc for calling with the same parameters, what is the function already was called

		const REMOVE = Fragment.Types.remove;
		const REPLACE = Fragment.Types.replace;

		let {record: {from, to}, type} = fragment;
		const isReplace = type === REPLACE;
		const isRemove = type === REMOVE;

		let typeString = Fragment.Types[type];
		let {policy} = this;

		// check rule: range check
		if( !(from <= to) ) {
			let {fromMoreThanTo} = policy;
			if( fromMoreThanTo !== 'allow' ) {
				if( fromMoreThanTo === 'exclude' ) {
					fragment.setOptions({"inactive": true});
				}
				else {
					assert(false, `from(${from}) should be <= to(${to})`);
				}
			}
		}

		if( isRemove ) {
			// check rule: unique remove
			let {unUniqueRemove} = policy;
			if( unUniqueRemove !== 'allow' ) {
				if( this._removedBlocks[from + "|" + to] !== void 0 ) {

					if( unUniqueRemove === 'exclude' ) {
						fragment.setOptions({"inactive": true});
					}
					else {
						assert(false, 'This string block has already been removed');
					}
				}
			}
			// passing data for next checking
			this._removedBlocks[from + "|" + to] = null;
		}

		if( isRemove || isReplace ) {
			// check rule: inner changes - remove or replace inside remove or replace
			if( policy['__eraseInErase__allow'] === void 0 ) {
				// caching value to improve performance (eraseInErase is allowed by default)
				policy['__eraseInErase__allow'] = policy.eraseInErase == 'allow';
			}

			if( policy['__eraseInErase__allow'] === false ) {
				let {eraseInErase} = policy;
				let filterSignificantFragment = ({type, options = {}}) => (!options.inactive && (type === REMOVE || type === REPLACE));

				let outerFragments = this._fragmentsIndex.findOuter(from, to, {filter: filterSignificantFragment});

				if( outerFragments.length ) {
					if( eraseInErase === 'exclude' ) {
						fragment.setOptions({"inactive": true});
					}
					else {
						assert(false, `This fragment with type ${typeString} is located in another fragment`);
					}
				}

				let innerFragments = this._fragmentsIndex.find(from, to, {filter: filterSignificantFragment});
				if( innerFragments.length ) {
					if( eraseInErase === 'exclude' ) {
						innerFragments.forEach( (fragment) => (fragment.setOptions({"inactive": true})) );
					}
					else {
						assert(false, `This fragment with type ${typeString} is covers another fragments`);
					}
				}
			}
		}
	}
}
StringAlter.defaultPolicy = {
	'fromMoreThanTo': 'error'
	, 'unUniqueRemove': 'error'
	, 'eraseInErase': 'allow'
}

StringAlter.version = BUILD_VERSION;

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	module.exports = StringAlter;
}
