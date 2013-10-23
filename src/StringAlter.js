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

	sub(fragment) {
		if( fragment ) {
			if( !this.subs ) {
				this.subs = [];
			}

			if( Array.isArray(fragment) ) {
				this.subs.push(...fragment);
			}
			else if( fragment instanceof Fragment ) {
				this.subs.push(fragment);
			}

			return null;
		}
		else {
			return this.subs;
		}
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

	extractData(recordsCache) {
		if( this.extracted ) {
			if( this.expressions ) {
				return this.expressions.length;
			}
			return 0;
		}

		let {from: fragmentFrom, to: fragmentTo} = this.record;

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

			data.replace(Record.uniqueRE, function(str, from, to, offset) {
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

				let recordKey = from + "|" + to;

				this.expressions.push(recordsCache[recordKey]);
				newData.push(data.substring(prevOffset, offset));

				prevOffset = offset + str.length;
			}.bind(this));

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
}
Fragment.Types = {replace: 1, insert: 2, remove: 3 };

class StringAlter {
	constructor(source, fragments = [], offsets = [], recordsCache = {}) {
		this._source = new String(source);//TODO:: [new get logic] after new get logic completed replace it to this._source = source
		this.reset(fragments, offsets, recordsCache);
	}

	reset(fragments = [], offsets = [], recordsCache = {}) {
		this._fragments = fragments;
		this._offsets = offsets;
		this._fragmentStates = {};
		this._fragmentStatesArray = [];
		this.__prevStateName = this.__currentStateName = void 0;
		this._fragmentsGroupId = 0;

		this._index = {
			indexFrom: []
//			, indexTo: []
//			, rangeFrom_count: []
//			, rangeTo_count: []

			, recordIndexFrom: []
		};
		this._records = recordsCache;
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

		if( options ) {
			fragment.options = options;
		}

		fragment.__createdIndex = this._fragments.length;
		this._fragments.push(fragment);
		this._addRecordToIndex(fragment.record, from, to, fragment, this._index.indexFrom);

//		if( options && options.__newTransitionalSubLogic ) {// Transitional period
			for( let record of this._findFragmentRecords(from, to) ) {
				record.sub(fragment);
			}
//		}
	}

	_addRecordToIndex(record, from = record.from, to = record.to, data = record, index = this._index.recordIndexFrom) {
		let key = from + "";
		let indexes = key.split("");
		let deep = indexes.length;
		let maxLimitName = "__maxTo" + deep;
		let minLimitName = "__minFrom" + deep;
		let currentIndexContainer = index;

		if( currentIndexContainer[maxLimitName] === void 0 || currentIndexContainer[maxLimitName] < to ) {
			currentIndexContainer[maxLimitName] = to;
		}
		if( currentIndexContainer[minLimitName] === void 0 || currentIndexContainer[minLimitName] > from ) {
			currentIndexContainer[minLimitName] = from;
		}
		for( let indexValue of indexes ) {
			indexValue = indexValue | 0;
			if( !currentIndexContainer[indexValue] ) {
				currentIndexContainer = currentIndexContainer[indexValue] = [];
			}
			else {
				currentIndexContainer = currentIndexContainer[indexValue];
			}
			if( currentIndexContainer[maxLimitName] === void 0 || currentIndexContainer[maxLimitName] < to ) {
				currentIndexContainer[maxLimitName] = to;
			}
			if( currentIndexContainer[minLimitName] === void 0 || currentIndexContainer[minLimitName] > from ) {
				currentIndexContainer[minLimitName] = from;
			}
		}
		if( !currentIndexContainer.__value ) {
			currentIndexContainer.__value = [];
		}
		currentIndexContainer.__value.push(data);

//		key = to + "";
//		indexes = key.split("");
//		deep = indexes.length;
//		limitName = "__minFrom" + deep;
//		currentIndexContainer = this._index.indexTo;
//		if( currentIndexContainer[limitName] === void 0 || currentIndexContainer[limitName] > from ) {
//			currentIndexContainer[limitName] = from;
//		}
//		for( ii = 0, len = indexes.length ; ii < len ; ii++ ) {
//			let indexValue = indexes[ii] | 0;
//			if( !currentIndexContainer[indexValue] ) {
//				currentIndexContainer = currentIndexContainer[indexValue] = [];
//			}
//			else {
//				currentIndexContainer = currentIndexContainer[indexValue];
//			}
//			if( currentIndexContainer[limitName] === void 0 || currentIndexContainer[limitName] > from ) {
//				currentIndexContainer[limitName] = from;
//			}
//		}
//		if( !currentIndexContainer.__value ) {
//			currentIndexContainer.__value = [];
//		}
//		currentIndexContainer.__value.push(fragment);
	}

	_findRecordFragments(from, to, doNotSort = false) {
		let result = [];

		let fromPendingValue, toPendingValue;

		let toNumbers_fn = (v) => v | 0;

		let fromKey = from + "";
		let fromKeys = fromKey.split("").map(toNumbers_fn);
		let fromDeep = fromKeys.length;
		let maxLimitName = "__maxTo" + fromDeep;

		let toKey = to + "";
		let toKeys = toKey.split("");
		let toDeep = toKeys.length;

//		if( fromDeep > toDeep ) {
//			throw new Error("'from' value must be <= 'to' value");
//		}
//		if( fromDeep > 9 || toDeep > 9 ) {
//			throw new Error("'from' or 'to' value > 999999999 unsuported");//for 999999999 index file size must be ~1Gib
//		}
		if( fromDeep < toDeep ) {
			toPendingValue = to;

			to = fromKey.replace(/\d/g, "9") | 0;

			fromPendingValue = to + 1;
		}

		let currentIndex, lastFromNumberIndex = fromDeep - 1;
		let index = this._index.indexFrom;
		let lastKey = fromKeys[lastFromNumberIndex];

		while( from <= to ) {
			if( !currentIndex ) {
				currentIndex = index;
				for( let jj = 0, jjKey ; jj < fromDeep - 1 ; jj++ ) {
					jjKey = fromKeys[jj] | 0;
					currentIndex = currentIndex[jjKey];
					if( currentIndex ) {
						if( currentIndex[maxLimitName] < from ) {
							//fast check: fragments in this index has changes outside current recort
							currentIndex = void 0;
						}
					}
					if( !currentIndex ) {
						break;
					}
				}
			}

			if( currentIndex ) {
				let currentIndexContainer = currentIndex[lastKey];

				if( currentIndexContainer && currentIndexContainer[maxLimitName] >= from ) {
					currentIndexContainer = currentIndexContainer.__value;
					if( currentIndexContainer ) {
						for( let frag of currentIndexContainer ) {
							let {to: fragTo} = frag.record;

							if( fragTo <= to ) {
								result.push(frag);
							}
						}
					}
				}
			}

			from++;
			lastKey = fromKeys[lastFromNumberIndex] = lastKey + 1;
			if( lastKey > 9 ) {
				fromKey = from + "";
				fromKeys = fromKey.split("").map(toNumbers_fn);
				lastKey = 0;
				currentIndex = void 0;
			}
		}

		if( fromPendingValue ) {
			result.push.apply(result, this._findRecordFragments(fromPendingValue, toPendingValue, true));
		}

		return doNotSort ? result : result.sort(function(a, b){return (a.__createdIndex - b.__createdIndex)});
	}

	_findFragmentRecords(fragmentFrom, fragmentTo) {
		let result = [];

		let toNumbers_fn = (v) => v | 0;

		let intValue = fragmentFrom;

		let fromKey = intValue + "";
		let fromKeys = fromKey.split("").map(toNumbers_fn);
		let fromDeep = fromKeys.length;
		let maxLimitName = "__maxTo" + fromDeep;
		let minLimitName = "__minFrom" + fromDeep;

		let index = this._index.recordIndexFrom;

		let currentIndex = index
			, stashedIndexes = []
			, currentDeep = 1
			, currentDeepDiff = fromDeep - currentDeep
		;

		function checkRecords(records) {
			if( !records ) {
				return;
			}

			for( let record of records ) {
				let {from, to} = record;
				if( from <= fragmentFrom && to >= fragmentTo ) {
					result.push(record);
				}
			}
		}

		while( intValue > 0 ) {
			let keyValue = fromKeys[currentDeep - 1];
			let indexValue;

			let decrementKeys = true;

			if( indexValue = currentIndex[keyValue] ) {
				if( indexValue[minLimitName] <= fragmentFrom && indexValue[maxLimitName] >= fragmentTo ) {
					if( currentDeep === fromDeep ) {
						checkRecords(indexValue.__value);
					}
					else {
						currentDeep++;
						currentDeepDiff = fromDeep - currentDeep;
						stashedIndexes.push(currentIndex);
						currentIndex = indexValue;

						decrementKeys = false;
					}
				}
			}

			if( decrementKeys ) {
				let updateKeys = true;

				if( currentDeepDiff ) {
					intValue = intValue - (1 + (fromKeys.slice(currentDeep).join("") | 0));
				}
				else {//max deep
					intValue--;
					updateKeys = (fromKeys[currentDeep - 1] = fromKeys[currentDeep - 1] - 1) < 0;
				}

				if( updateKeys ) {
					fromKeys = (intValue + "").split("").map(toNumbers_fn);

					if( fromDeep !== fromKeys.length ) {
						fromDeep = fromKeys.length;
						maxLimitName = "__maxTo" + fromDeep;
						minLimitName = "__minFrom" + fromDeep;
					}

					if( currentDeep > 1 ) {
						currentIndex = stashedIndexes.pop();
						currentDeep--;
						currentDeepDiff = fromDeep - currentDeep;
					}
				}
			}
		}

		return result;
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
		let recordKey = from + "|" + to;
		if( this._records[recordKey] ) {
			return this._records[recordKey];
		}

		let record = this._records[recordKey] = new Record(from, to);

		this._addRecordToIndex(record, from, to);

		let recordFragments = this._findRecordFragments(from, to);

		if( recordFragments && recordFragments.length ) {
			// [new get logic]
			record.sub(recordFragments);
		}
		record._source = this._source;//TODO:: [new get logic] after new get logic completed remove this line

		return record;
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
	 * @param {Array=} offsets
	 * @returns {*}
	 */
	updatePosition(pos, offsets = this._offsets) {
		if( !offsets.length ) {
			return pos;
		}
		return this.updateRecord({from: pos, to: pos}, offsets, true).from;
	}

	updateRecord({from, to}, offsets = this._offsets, considerExtends = false) {//TODO:: optimize function speed
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

		return new Record(from, to);
	}

	groupedFragments(fragments = this._fragments) {
		let lastStart, lastEnd, groupFrag, groupFragIndex;
		for( let fragmentsLength = fragments.length - 1 ; fragmentsLength >= 0 ;  fragmentsLength-- ) {
			let frag = fragments[fragmentsLength];
			let {from, to} = frag.record;
			let groupFragExtend = groupFrag && groupFrag.type !== Fragment.Types.insert
				, currFragExtend = frag.type !== Fragment.Types.insert || (frag.options || {}).extend
				;

			if( lastEnd &&
				(
					from > lastStart && to < lastEnd
						|| (groupFragExtend && currFragExtend && (from >= lastStart && to <= lastEnd))
					)
				) {
				groupFrag.sub(frag);
				fragments.splice(fragmentsLength, 1);
			}
			else if( lastEnd &&
				(
					from < lastStart && to > lastEnd
						|| (groupFragExtend && currFragExtend && (from <= lastStart && to >= lastEnd))
					)
				) {
				frag.sub(groupFrag);
				fragments.splice(groupFragIndex, 1);
				groupFrag = frag;
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
	}

	restoreState() {
		var frags = this._fragmentStates[this.__currentStateName = this.__prevStateName];
		if( frags ) {
			this._fragments = frags;
		}
	}

	apply(forcePreparation = false) {
		let offsets = this._offsets;
		let fragments = this._fragments;
		let sourceString = this._source;
		let fragmentsLength = fragments.length;

		if( fragmentsLength && (fragments[0].originalIndex === void 0 || forcePreparation === true) ) {
			let fragmentsGroups = Object.create(null);
			for( let index = 0 ; index < fragmentsLength ;  index++ ) {
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
		fragments = this.groupedFragments(fragments);
		fragmentsLength = fragments.length;

		let outsStr = "", outs = [];

		let pos = this.updatePosition(0, offsets)
			, clearPos = 0
			//, posOffset = 0
		;

		if( pos !== 0 ) {
			outsStr = sourceString.slice(0, pos);
		}

		let currentOffsets = offsets.slice();
		let postFragments = [];

		for (let index = 0; index < fragmentsLength; index++) {
			let frag = fragments[index];
			let fragOptions = (frag.options || {});

			if( typeof fragOptions.before === "function" ) {
				fragOptions.before.call(frag);
			}

			let expressionsLength = frag.extractData(this._records);

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

			let subFragments = frag.sub();
			if( subFragments ) {
				outsStr += outs.join("");

				let subAlter = new StringAlter(
					outsStr + sourceString.slice(pos, from) + sourceString.slice(from, to) + sourceString.substring(to)
					, subFragments
					, this._offsets
					, this._records
				);
				sourceString = subAlter.apply();

				let offsetPos = this.updatePosition(clearPos, offsets);

				pos = offsetPos;

				offsets = this._offsets;
				currentOffsets = this._offsets.slice();
				({from, to}) = this.updateRecord(frag.record, offsets);
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
						let subFragments = record.sub();
						if( subFragments ) {
							let alter = new StringAlter(sourceString, subFragments, [-record.from]);
							sourceString = alter.apply(true);
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
					record = this.updateRecord(record, currentOffsets);
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
			if( offset ) {
				let newIsAdding = to === from && !fragOptions.extend
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

		sourceString = outsStr + outs.join("");

		this._fragmentStatesArray.unshift(postFragments);

		while( postFragments = this._fragmentStatesArray.shift() ) {
			if( postFragments.length ) {
				let subAlter = new StringAlter(
					sourceString
					, postFragments
					, this._offsets
				);
				sourceString = subAlter.apply();
			}
		}

		this.reset();

		return sourceString;
	}
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	module.exports = StringAlter;
}
