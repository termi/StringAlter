var SLICE$0 = Array.prototype.slice;function ITER$0(v,f){if(v){if(Array.isArray(v))return f?v.slice():v;var i,r;if(typeof v==='object'&&typeof v['@@iterator']==='function'){i=v['@@iterator'](),r=[];while((f=i['next']()),f['done']!==true)r.push(f['value']);return r;}}throw new Error(v+' is not iterable')};function GET_ITER$0(v){if(v){if(Array.isArray(v))return 0;if(typeof v==='object'&&typeof v['@@iterator']==='function')return v['@@iterator']();}throw new Error(v+' is not iterable')};"use strict";

var assert = this["assert"] || (function(expect, msg)  { if(expect != true)throw new Error(msg || "") });

var RangeIndex = (function(){
	function RangeIndex() {
		this.reset();
	}

	RangeIndex.prototype.reset = function() {
		this.indexFrom = [];
		//TODO::this.indexTo = [];
	}

	RangeIndex.prototype.add = function(from, to, data) {var $D$11;var $D$12;var $D$13;
		var index = this.indexFrom
			, indexeKeys = (("" + from) + "").split("")
			, length = indexeKeys.length// key deep
			, maxLimitProp = (("__maxTo" + length) + "")
			, minLimitProp = (("__minFrom" + length) + "")
		;

		if( !(index[maxLimitProp] >= to) ) {
			index[maxLimitProp] = to;
		}
		if( !(index[minLimitProp] <= from) ) {
			index[minLimitProp] = from;
		}

		$D$11 = GET_ITER$0(indexeKeys);$D$12 = $D$11 === 0;$D$13 = ($D$12 ? indexeKeys.length : void 0);for( var indexKey ; $D$12 ? ($D$11 < $D$13) : !($D$13 = $D$11["next"]())["done"]; ){indexKey = ($D$12 ? indexeKeys[$D$11++] : $D$13["value"]);
			indexKey = indexKey | 0;

			index = index[indexKey] || (index[indexKey] = []);

			if( !(index[maxLimitProp] >= to) ) {
				index[maxLimitProp] = to;
			}
			if( !(index[minLimitProp] <= from) ) {
				index[minLimitProp] = from;
			}
		};$D$11 = $D$12 = $D$13 = void 0;
		(index.__data || (index.__data = [])).push({from: from, to: to, data: data});
	}

	RangeIndex.prototype.find = function(from) {var $D$14;var $D$15;var $D$16;var to = arguments[1];if(to === void 0)to = from;var options = arguments[2];if(options === void 0)options = {};
//		if( from > to ) throw new Error("'from' value must be <= 'to' value");
		var index = this.indexFrom
			, result = []
			, onfind = options.onfind
		;

		var pendingFromValue
			, pendingToValue
		;

		var fromKey = (("" + from) + "")
			, fromKeys = (function(){var $D$3;var $D$4;var $D$5;var $D$6;var $result$0 = [], v;$D$6 = (fromKey.split(""));$D$3 = GET_ITER$0($D$6);$D$4 = $D$3 === 0;$D$5 = ($D$4 ? $D$6.length : void 0);for(; $D$4 ? ($D$3 < $D$5) : !($D$5 = $D$3["next"]())["done"]; ){v = ($D$4 ? $D$6[$D$3++] : $D$5["value"]);{$result$0.push(v | 0)}};;return $result$0})()
			, fromDeep = fromKeys.length
			, maxLimitProp = (("__maxTo" + fromDeep) + "");

		var toKey = (("" + to) + "")
			, toKeys = toKey.split("")
			, toDeep = toKeys.length
		;

//		if( fromDeep > 9 || toDeep > 9 ) throw new Error("'from' or 'to' value > 999999999 unsuported");//for 999999999 index file size must be ~1Gib
		if( fromDeep < toDeep ) {
			pendingToValue = to;

			to = fromKey.replace(/\d/g, "9") | 0;

			pendingFromValue = to + 1;
		}

		var subIndex
			, lastFromNumberIndex = fromDeep - 1
			, lastKey = fromKeys[lastFromNumberIndex]
		;

		while( from <= to ) {
			if( !subIndex ) {
				subIndex = index;
				for( var fromKeyIndex = 0, fromKey$0 ; fromKeyIndex < fromDeep - 1 ; fromKeyIndex++ ) {
					fromKey$0 = fromKeys[fromKeyIndex] | 0;
					subIndex = subIndex[fromKey$0];
					if( subIndex ) {
						if( subIndex[maxLimitProp] < from ) {
							//fast check: fragments in this index has changes outside current recort
							subIndex = void 0;
						}
					}
					if( !subIndex ) {
						break;
					}
				}
			}

			if( subIndex ) {
				var subIndexContainer = subIndex[lastKey];

				if( subIndexContainer && subIndexContainer[maxLimitProp] >= from ) {
					subIndexContainer = subIndexContainer.__data;
					if( subIndexContainer ) {
						$D$14 = GET_ITER$0(subIndexContainer);$D$15 = $D$14 === 0;$D$16 = ($D$15 ? subIndexContainer.length : void 0);for( var record ; $D$15 ? ($D$14 < $D$16) : !($D$16 = $D$14["next"]())["done"]; ){record = ($D$15 ? subIndexContainer[$D$14++] : $D$16["value"]);
							var foundTo = record.to;

							if( foundTo <= to && (!onfind || onfind(record.data, record.from, record.to) !== false) ) {
								result.push(record.data);
							}
						};$D$14 = $D$15 = $D$16 = void 0;
					}
				}
			}

			from++;
			lastKey = fromKeys[lastFromNumberIndex] = lastKey + 1;
			if( lastKey > 9 ) {
				fromKey = (("" + from) + "");
				fromKeys = fromKey.split("").map( function(v)  {return v | 0} );
				lastKey = 0;
				subIndex = void 0;
			}
		}

		if( pendingFromValue ) {
			result.push.apply(result, ITER$0(this.find(pendingFromValue, pendingToValue, options)));
		}

		return result;
	}

	RangeIndex.prototype.findOuter = function(innerFrom) {var innerTo = arguments[1];if(innerTo === void 0)innerTo = innerFrom;var options = arguments[2];if(options === void 0)options = {};
		var index = this.indexFrom
			, result = []
			, onfind = options.onfind
		;

		var intValue = innerFrom
			, fromKey = (("" + intValue) + "")
			, fromKeys = (function(){var $D$7;var $D$8;var $D$9;var $D$10;var $result$1 = [], v;$D$10 = (fromKey.split(""));$D$7 = GET_ITER$0($D$10);$D$8 = $D$7 === 0;$D$9 = ($D$8 ? $D$10.length : void 0);for(; $D$8 ? ($D$7 < $D$9) : !($D$9 = $D$7["next"]())["done"]; ){v = ($D$8 ? $D$10[$D$7++] : $D$9["value"]);{$result$1.push(v | 0)}};;return $result$1})()
			, fromDeep = fromKeys.length
			, maxLimitProp = (("__maxTo" + fromDeep) + "")
			, minLimitName = (("__minFrom" + fromDeep) + "")
		;

		var subIndex = index
			, stashedIndexes = []
			, currentDeep = 1
			, currentDeepDiff = fromDeep - currentDeep
		;

		var checkRecords = function()  {var $D$17;var $D$18;var $D$19;var records = arguments[0];if(records === void 0)records = [];
			$D$17 = GET_ITER$0(records);$D$18 = $D$17 === 0;$D$19 = ($D$18 ? records.length : void 0);for( var record ; $D$18 ? ($D$17 < $D$19) : !($D$19 = $D$17["next"]())["done"]; ){record = ($D$18 ? records[$D$17++] : $D$19["value"]);
				var from = record.from, to = record.to;
				if( from <= innerFrom && to >= innerTo ) {
					result.push(record.data);
				}
			};$D$17 = $D$18 = $D$19 = void 0;
		}

		while( intValue > 0 ) {
			var keyValue = fromKeys[currentDeep - 1];
			var indexValue;

			var decrementKeys = true;

			if( indexValue = subIndex[keyValue] ) {
				if( indexValue[minLimitName] <= innerFrom && indexValue[maxLimitProp] >= innerTo ) {
					if( currentDeep === fromDeep ) {
						checkRecords(indexValue.__data);
					}
					else {
						currentDeep++;
						currentDeepDiff = fromDeep - currentDeep;
						stashedIndexes.push(subIndex);
						subIndex = indexValue;

						decrementKeys = false;
					}
				}
			}

			if( decrementKeys ) {
				var updateKeys = true;

				if( currentDeepDiff ) {
					intValue = intValue - (1 + (fromKeys.slice(currentDeep).join("") | 0));
				}
				else {//max deep
					intValue--;
					updateKeys = (fromKeys[currentDeep - 1] = fromKeys[currentDeep - 1] - 1) < 0;
				}

				if( updateKeys ) {
					fromKeys = (("" + intValue) + "").split("").map( function(v)  {return v | 0} );

					if( fromDeep !== fromKeys.length ) {
						fromDeep = fromKeys.length;
						maxLimitProp = (("__maxTo" + fromDeep) + "");
						minLimitName = (("__minFrom" + fromDeep) + "");
					}

					if( currentDeep > 1 ) {
						subIndex = stashedIndexes.pop();
						currentDeep--;
						currentDeepDiff = fromDeep - currentDeep;
					}
				}
			}
		}

		return result;
	}
;return RangeIndex;})();

var Record = (function(){
	function Record(from, to) {
		this.from = from;
		this.to = to;
	}

	Record.prototype.toString = function() {
		return Record.uniqueStart + "[" + this.from + "]" + Record.uniqueSeparator + "[" + this.to + "]" + Record.uniqueEnd;
	}

	Record.prototype.addSubs = function() {var $D$0;var fragments = SLICE$0.call(arguments, 0);
		if( fragments.length ) {
			if( !this.subs ) {
				this.subs = [];
			}
			($D$0 = this.subs).push.apply($D$0, ITER$0(fragments));
		;$D$0 = void 0}
	}

	Record.prototype.getSubs = function(fragment) {
		return this.subs;
	}
;return Record;})();
Record.uniqueStart = "[<" + ((Math.random() * 1e8) | 0);//should matches /\[\<\d{8}/
Record.uniqueSeparator = "" + ((Math.random() * 1e8) | 0);//should matches /\d{8}/
Record.uniqueEnd = ((Math.random() * 1e8) | 0) + ">]";//should matches /\d{8}\>\]/
Record.uniqueRE = new RegExp("\\[\\<\\d{" + (Record.uniqueStart.length - 2) + "}\\[(\\d+)\\]\\d{" + Record.uniqueSeparator.length + "}\\[(\\d+)\\]\\d{" + (Record.uniqueEnd.length - 2) + "}\\>\\]", "g");

var Fragment = (function(){
	function Fragment(from, to) {var insertStr = arguments[2];if(insertStr === void 0)insertStr = "";var type = arguments[3];if(type === void 0)type = Fragment.Types.replace;
		this.record = new Record(from, to);
		this.type = type;

		this.data = insertStr;
		this.expressions = void 0;
	}
	
	Fragment.prototype.addSubs = function() {var $D$1;var fragments = SLICE$0.call(arguments, 0);
		if( fragments.length ) {
			if( !this.subs ) {
				this.subs = [];
			}
			($D$1 = this.subs).unshift.apply($D$1, ITER$0(fragments));
		;$D$1 = void 0}
	}	

	Fragment.prototype.getSubs = function() {
		return this.subs;
	}

	Fragment.prototype.extractData = function(recordsCache) {var this$0 = this;
		if( this.extracted ) {
			if( this.expressions ) {
				return this.expressions.length;
			}
			return 0;
		}

		var fragmentFrom = (fragmentTo = (this).record).from, fragmentTo = fragmentTo.to;

		var data = this.data;
		var fragmentsLen;

		var minFrom = -1;
		var maxTo = -1;

		var isIsolate = true;

		if( data instanceof Record ) {
			this.expressions = [data];
			this.data = [];
			fragmentsLen = 1;
		}
		else {
			fragmentsLen = 0;
			var prevOffset = 0;
			var newData;

			data = data + "";

			data.replace(Record.uniqueRE, function(str, from, to, offset)  {
				fragmentsLen++;

				from |= 0;
				to |= 0;

				if( !newData ) {//first found
					newData = [];
					this$0.expressions = [];
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

				var recordKey = from + "|" + to;

				this$0.expressions.push(recordsCache[recordKey]);
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
;return Fragment;})();
Fragment.Types = {replace: 1, insert: 2, remove: 3 };

var StringAlter = (function(){
	function StringAlter(source) {var fragments = arguments[1];if(fragments === void 0)fragments = [];var offsets = arguments[2];if(offsets === void 0)offsets = [];var recordsCache = arguments[3];if(recordsCache === void 0)recordsCache = {};
		this.reset(
			new String(source)//TODO:: [new get logic] after new get logic completed replace it to this._source = source
			, fragments
			, offsets
			, recordsCache
		);
	}

	StringAlter.prototype.reset = function() {var source = arguments[0];if(source === void 0)source = '';var fragments = arguments[1];if(fragments === void 0)fragments = [];var offsets = arguments[2];if(offsets === void 0)offsets = [];var recordsCache = arguments[3];if(recordsCache === void 0)recordsCache = {};var fragmentStatesArray = arguments[4];if(fragmentStatesArray === void 0)fragmentStatesArray = [];
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

		if( this._records == recordsCache ) {
			// no needs to reindex
		}
		else {
			this._records = recordsCache;
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
	}

	StringAlter.prototype._createFragment = function(from, to, data, type, options) {var $D$20;var $D$21;var $D$22;var $D$23;
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

		var fragment = new Fragment(from, to, data + "", type);

		if( options ) {
			fragment.options = options;
		}

		fragment.__createdIndex = this._fragments.length;
		this._fragments.push(fragment);
		this._fragmentsIndex.add(from, to, fragment);

//		if( options && options.__newTransitionalSubLogic ) {// Transitional period
			$D$23 = (this._getRecorsIndex.findOuter(from, to));$D$20 = GET_ITER$0($D$23);$D$21 = $D$20 === 0;$D$22 = ($D$21 ? $D$23.length : void 0);for( var record ; $D$21 ? ($D$20 < $D$22) : !($D$22 = $D$20["next"]())["done"]; ){record = ($D$21 ? $D$23[$D$20++] : $D$22["value"]);
				record.addSubs(fragment);
			};$D$20 = $D$21 = $D$22 = $D$23 = void 0;
//		}
	}

	StringAlter.prototype.hasChanges = function() {
		return !!(this._fragments.length || this._fragmentStatesArray.length);
	}

	/**
	 *
	 * @param {number} from
	 * @param {number} to
	 * @returns {Record}
	 */
	StringAlter.prototype.get = function(from, to) {
		assert(from <= to, 'from(' + from + ') should be <= to(' + to + ')');

		var recordKey = from + "|" + to;
		if( this._records[recordKey] ) {
			return this._records[recordKey];
		}

		var record = this._records[recordKey] = new Record(from, to);

		this._getRecorsIndex.add(from, to, record);

		var recordFragments = this._fragmentsIndex.find(from, to).sort( function(a, b)  {var a = a.__createdIndex;var b = b.__createdIndex;return a - b}  );

		if( recordFragments ) {
			// [new get logic]
			record.addSubs.apply(record, ITER$0(recordFragments));
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
	StringAlter.prototype.getRange = function(from, to) {
		assert(from <= to, 'from(' + from + ') should be <= to(' + to + ')');
		
		return this._source.substring(from, to);
	}

	/**
	 *
	 * @param to
	 * @param data
	 * @param {Object=} options
	 * @returns {StringAlter}
	 */
	StringAlter.prototype.insert = function(to, data, options) {
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
	StringAlter.prototype.insertAfter = function(to, data) {var options = arguments[2];if(options === void 0)options = {};
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
	StringAlter.prototype.insertBefore = function(to, data) {var options = arguments[2];if(options === void 0)options = {};
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
	StringAlter.prototype.remove = function(from, to, options) {
		assert(from <= to, 'from(' + from + ') should be <= to(' + to + ')');

		if( this._removedBlocks[from + "|" + to] !== void 0 ) {
			// TODO:: check methods 'move', 'replace', etc for calling with the same parameters, what is the function already was called
			assert(false, 'This string block has already been removed');
		}
		this._removedBlocks[from + "|" + to] = null;

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
	StringAlter.prototype.move = function(srcFrom, srcTo, destination, options) {
		assert(srcFrom <= srcTo, 'srcFrom(' + srcFrom + ') should be <= srcTo(' + srcTo + ')');

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
	StringAlter.prototype.replace = function(from, to, data, options) {
		assert(from <= to, 'from(' + from + ') should be <= to(' + to + ')');

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
	StringAlter.prototype.wrap = function(from, to, start, end) {var options = arguments[4];if(options === void 0)options = {};
		assert(from <= to, 'from(' + from + ') should be <= to(' + to + ')');

		options.group = ++this._fragmentsGroupId;

		var firstInsertOptions = Object.create(options);
		firstInsertOptions.reverse = true;

		this.insert(from, start, firstInsertOptions);//TODO::insertBefore
		this.insert(to, end, options);//TODO::insertAfter
		return this;
	}

	StringAlter.prototype.setState = function(newStateName) {
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

	StringAlter.prototype.restoreState = function() {
		var frags = this._fragmentStates[this.__currentStateName = this.__prevStateName];
		if( frags ) {
			this._fragments = frags;
		}

		return this;
	}


	/**
	 *
	 * @param pos
	 * @param {Array=} offsets
	 * @returns {*}
	 */
	StringAlter.prototype.updatePosition = function(pos) {var offsets = arguments[1];if(offsets === void 0)offsets = this._offsets;
		if( !offsets.length ) {
			return pos;
		}
		return this.updateRecord({from: pos, to: pos}, offsets, true, true).from;
	}

	StringAlter.prototype.updateRecord = function(to) {var from = to.from, to = to.to;var offsets = arguments[1];if(offsets === void 0)offsets = this._offsets;var offsetValuesDelimiter = arguments[2];if(offsetValuesDelimiter === void 0)offsetValuesDelimiter = this._source.length;var considerExtends = arguments[3];if(considerExtends === void 0)considerExtends = false;//TODO:: optimize function speed
		if( offsets && offsets.length ) {
			var positionOffset = 0;
			var originalFrom = from + positionOffset, originalTo = to + positionOffset;

			for( var offset in offsets ) if( offsets.hasOwnProperty(offset) ) {
				// Fast enumeration through sparse array MAY CAUSE PROBLEM WITH WRONG ORDER OF ARRAY ITEM, but it is unlikely
				offset = offset | 0;

				var offsetValue = offsets[offset];
				var extendValue = 0;
				var addingValue = 0;

				if( typeof offsetValue === "string" ) {
					offsetValue += "";
					var index = offsetValue.indexOf("|");
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

		return new Record(from, to);
	}

	StringAlter.prototype.groupedFragments = function() {var fragments = arguments[0];if(fragments === void 0)fragments = this._fragments;
		var lastStart, lastEnd, groupFrag, groupFragIndex;
		
		for( var fragmentsLength = fragments.length - 1 ; fragmentsLength >= 0 ;  fragmentsLength-- ) {
			var frag = fragments[fragmentsLength];
			var from = (to = frag.record).from, to = to.to;
			var groupFragExtend = groupFrag && groupFrag.type !== Fragment.Types.insert
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

	StringAlter.prototype.apply = function() {var $D$2;var forcePreparation = arguments[0];if(forcePreparation === void 0)forcePreparation = false;
		var offsets = this._offsets;
		var fragments = this._fragments;
		var sourceString = this._source;
		var fragmentsLength = fragments.length;
		var sourceStringLength = sourceString.length;
		
//		console.log(this.printFragments(fragments ).join("\n"), "\n-------------============stages============-------------\n", this._fragmentStatesArray.reduce(function(arr, fragments){ arr.push.apply(arr, this.printFragments(fragments));return arr }.bind(this), []).join("\n"))
//		console.log(fragments)

		if( fragmentsLength && (fragments[0].originalIndex === void 0 || forcePreparation === true) ) {
			var fragmentsGroups = Object.create(null);
			for( var index = 0 ; index < fragmentsLength ;  index++ ) {
				var frag = fragments[index];

				var fragmentOptions = ((fragmentOptions = frag.options) === void 0 ? {} : fragmentOptions);

				if( fragmentOptions["inactive"] === true ) {//TODO: tests
					fragments.splice(index, 1);
					index--;
					fragmentsLength--;

					continue;
				}

				var group = fragmentOptions.group;

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

				var aStart = (aEnd = a.record).from, aEnd = aEnd.to;
				var bStart = (bEnd = b.record).from, bEnd = bEnd.to;
				var result = aStart - bStart;

				if( result === 0 ) {
					var aReverse = (aAfter = a.options || {}).reverse, aPriority = aAfter.priority, aExtend = aAfter.extend, aBefore = aAfter.before, aAfter = aAfter.after;
					var bReverse = (bAfter = b.options || {}).reverse, bPriority = bAfter.priority, bExtend = bAfter.extend, bBefore = bAfter.before, bAfter = bAfter.after;

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

		var outsStr = "", outs = [];

		var pos = this.updatePosition(0, offsets)
			, clearPos = 0
			//, posOffset = 0
		;

		if( pos !== 0 ) {
			if( pos < 0 ) pos = 0;// 'pos' can be < 0 (due offsets) - ignoring this case
			outsStr = sourceString.slice(0, pos);
		}

		var currentOffsets = offsets.slice();
		var postFragments = [];

		for (var index$0 = 0; index$0 < fragmentsLength; index$0++) {
			var frag$0 = fragments[index$0];
			var fragOptions = ((fragOptions = frag$0.options) === void 0 ? {} : fragOptions);

			if( typeof fragOptions.onbefore === "function" ) {
				var beforeOut = fragOptions.onbefore.call(frag$0, fragOptions, frag$0.data);
				if( beforeOut !== void 0 ) {
					frag$0.data = beforeOut;
				}
			}

			var expressionsLength = frag$0.extractData(this._records);

			var from = (to = this.updateRecord(frag$0.record, currentOffsets)).from, to = to.to;
			if( frag$0.type === Fragment.Types.insert ) {
				to = from;
			}

			assert(
				pos <= from
					|| from === to//nothing to remove
				, "'pos' (" + pos + ") shoulde be <= 'start' (" + from + ") or 'start' (" + from + ") == 'end' (" + to + ")"
			);
			assert(from <= to, "from (" + from + ") should be <= to (" + to + ")");

			if( fragOptions.applyChanges && expressionsLength ) {
				var anotherFrag = void 0;
				if(
					( frag$0.maxTo > frag$0.record.to && (anotherFrag = fragments[index$0 + 1]) && anotherFrag.record.from < frag$0.maxTo )
					|| ( frag$0.minFrom < frag$0.record.from && (anotherFrag = fragments[index$0 - 1]) && anotherFrag.record.to > frag$0.minFrom )
				) {
					postFragments.push(frag$0);
					continue;
				}
			}

			var subFragments = frag$0.getSubs();
			if( subFragments ) {
				outsStr += outs.join("");

				var subAlter = new StringAlter(
					outsStr + sourceString.slice(pos, from) + sourceString.slice(from, to) + sourceString.substring(to)
					, subFragments
					, this._offsets
					, this._records
				);
				sourceString = subAlter.apply();
				subAlter.reset();

				var offsetPos = this.updatePosition(clearPos, offsets);

				pos = offsetPos;

				offsets = this._offsets;
				currentOffsets = this._offsets.slice();
				from = ($D$2 = this.updateRecord(frag$0.record, offsets)).from, to = $D$2.to, $D$2;
				outs = [];
			;$D$2 = void 0}

			var string = void 0;
			if( fragOptions.__newTransitionalSubLogic && expressionsLength ) {// [new get logic]
				string = "";
				var data = frag$0.data
					, dataLength = data.length
				;
				for( var index$1 = 0 ; index$1 < expressionsLength ; index$1++ ) {
					if( dataLength ) {
						string += data[index$1];
					}

					var record = frag$0.expressions[index$1];

					if( record.__raw ) {
						string += record.__raw;
					}
					else {
						var sourceString$0 = record._source.substring(record.from, record.to);//this._source.substring(record.from, record.to);
						var subFragments$0 = record.getSubs();
						if( subFragments$0 ) {
							var alter = new StringAlter(sourceString$0, subFragments$0, [-record.from]);
							sourceString$0 = alter.apply(true);
							alter.reset();
						}
						string += (record.__raw = sourceString$0);
					}
				}
				string += data[expressionsLength];
			}
			else if( expressionsLength ) {//old logic
				string = "";
				var data$0 = frag$0.data
					, dataLength$0 = data$0.length
				;
				for( var index$2 = 0 ; index$2 < expressionsLength ; index$2++ ) {
					if( dataLength$0 ) {
						string += data$0[index$2];
					}
				
					var record$0 = frag$0.expressions[index$2];
					record$0 = this.updateRecord(record$0, currentOffsets);
					string += sourceString.substring(record$0.from, record$0.to);
				}
				string += data$0[expressionsLength];
			}
			else {
				string = frag$0.data;
			}

			{
				var transform = fragOptions.transform;
				if( typeof transform === "function" ) {
					string = transform.call(frag$0, string);
				}
			}

			var offset = string.length - ( to - from );
			if( offset ) {
				var newIsAdding = to === from && !fragOptions.extend
					, newIndex = frag$0.record.from + ( offset < 0 ? -offset - 1 : 0)// needs to inc index for negative offset
					, offsetValue = offsets[newIndex] || 0
					, addingValue = 0
					, extendValue = 0
				;

				if( typeof offsetValue === "string" ) {
					offsetValue += "";
					var index$3 = offsetValue.indexOf("|");
					if( index$3 !== -1 ) {//adding
						addingValue = offsetValue.substr(index$3 + 1) | 0;
						extendValue = offsetValue.substr(0, index$3) | 0;
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
					extendValue = (extendValue + "|" + addingValue);
				}
				else {
					extendValue = extendValue;
				}

				offsets[newIndex] = extendValue;
			}

			if( pos !== from ) {
				outs.push(sourceString.slice(pos, from));
			}
			outs.push(string);

			pos = to;
			clearPos = (frag$0.record).to, frag$0;
		}
		if (pos < sourceString.length) {
			outs.push(sourceString.slice(pos));
		}

		sourceString = outsStr + outs.join("");

		this._fragmentStatesArray.unshift(postFragments);

		this.reset(sourceString, void 0, this._offsets, void 0, this._fragmentStatesArray);

		while( postFragments = this._fragmentStatesArray.shift() ) {
			if( postFragments.length ) {
				this._fragments = postFragments;
				this.apply();
			}
		}

		return this._source;
	}
	
	StringAlter.prototype.toString = function() {
		return this._source;
	}

	StringAlter.prototype.printFragments = function() {var $D$24;var $D$25;var $D$26;var fragments = arguments[0];if(fragments === void 0)fragments = this._fragments;
		var result = [];
		$D$24 = GET_ITER$0(fragments);$D$25 = $D$24 === 0;$D$26 = ($D$25 ? fragments.length : void 0);for( var frag ; $D$25 ? ($D$24 < $D$26) : !($D$26 = $D$24["next"]())["done"]; ){frag = ($D$25 ? fragments[$D$24++] : $D$26["value"]);
			var type = frag.type, record = frag.record, remove = (insert = Fragment.Types).remove, insert = insert.insert

			result.push(
				(("" + (remove === type ? "REMOVE" : insert === type ? "INSERT" : "REPLACE")) + ":\t")
				+ (("[" + (record.from)) + ("" + (insert !== type ? ", " + record.to : "")) + "]")
				+ (("exp: " + ((frag.expressions || []).length)) + " | ")
				+ (("index: " + (frag.__createdIndex)) + " | ")
				+ (("opt: " + (JSON.stringify(frag.options))) + "")
				+ (("" + (remove !== type ? "\\n  data: '" + frag.data + "'" : "")) + " | ")
			);
		};$D$24 = $D$25 = $D$26 = void 0;

		return result;
	}
;return StringAlter;})();

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	module.exports = StringAlter;
}
