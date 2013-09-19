// alter.js
// MIT licensed

"use strict";

var assert = this["assert"] || function(expect, msg) {
	if( expect != true ) {
		throw new Error(msg || "");
	}
}

function getPositionsWithOffset(offsets, positionFrom, positionTo) {
	if( offsets && offsets.length ) {
		let originalFrom = positionFrom, originalTo = positionTo;

		for( let offset in offsets ) if( offsets.hasOwnProperty(offset) ) {
			// Fast enumeration through array MAY CAUSE PROBLEM WITH WRONG ORDER OF ARRAY ITEM, but it is unlikely
			offset = offset | 0;

			let offsetValue = offsets[offset];
			let integerValue = offsetValue | 0;
			let isAdding = (offsetValue - integerValue) === .5;

			if( offset <= originalTo ) {// must be <=
				if( offset < originalFrom || (isAdding && offset == originalFrom)) {// must be <=
					positionFrom += integerValue;
				}
				positionTo += integerValue;
			}
			else {
				break;
			}
		}
	}

	return [
		positionFrom
		, positionTo
	]
}

var stringAlter = {
	alter: alter
	, reset: function() {
		this.offsets = [];
		this.uniqueStart = "[<" + ((Math.random() * 1e8) | 0);//should matches /\[\<\d{8}/
		this.uniqueSeparator = "" + ((Math.random() * 1e8) | 0);//should matches /\d{8}/
		this.uniqueEnd = ((Math.random() * 1e8) | 0) + ">]";//should matches /\d{8}\>\]/
		this.uniqueRE = new RegExp("\\[\\<\\d{" + (this.uniqueStart.length - 2) + "}\\[(\\d+)\\]\\d{" + this.uniqueSeparator.length + "}\\[(\\d+)\\]\\d{" + (this.uniqueEnd.length - 2) + "}\\>\\]", "g");
	}
	, getFromToString: function(from, to) {
		return this.uniqueStart + "[" + from + "]" + this.uniqueSeparator + "[" + to + "]" + this.uniqueEnd;
	}
};
stringAlter.reset();

/**
 * @__this {core}
 * @param {string} sourceString
 * @param {Array.<{start: number, end: number}>} fragments
 * @param {Object=} __offsetObject
 * @returns {string}
 */
function alter(sourceString, fragments, __offsetObject) {
    "use strict";
	if(!this.__OFFFF)this.__OFFFF={};
	var __OFFFF = this.__OFFFF;

    assert(typeof sourceString === "string");
    assert(Array.isArray(fragments));

    let offsets = this.offsets;

    if( fragments.length && fragments[0].originalIndex === void 0 ) {
	    fragments = fragments.map(function(v, index) {
		    v.originalIndex = index;
		    return v;
	    });
    }

    fragments.sort(function(a, b) {
        var result = a.start - b.start;

        if( result === 0 ) {
			if( a.reverse && b.reverse && a.start === a.end && b.start === b.end ) {
				result = -1;//-(a.originalIndex - b.originalIndex)
			}
			else if( a.start === a.end ) {
				result = -1;//-(a.originalIndex - b.originalIndex)
			}
            else {
				result = 1;//a.originalIndex - b.originalIndex
			}
        }
		result = a.end - b.end;

		if( result === 0 ){
			if( a.priority === 0 ) {
				if( b.priority === 0 ) {
					result = -(a.originalIndex - b.originalIndex);
				}
				else {
					result = -1;
				}
			}
			else if( b.priority === 0 ) {
				if( a.priority === 0 ) {
					result = (a.originalIndex - b.originalIndex);
				}
				else {
					result = 1;
				}
			}
		}

		return (result === 0 ? ( (result = a.start - b.start) === 0 ? a.originalIndex - b.originalIndex : result) : result);
    });
	if(!__offsetObject)console.log(fragments)

	// create sub fragments
	for( let len = fragments.length - 1, lastStart, lastEnd, groupFrag ; len >= 0 ;  len-- ) {
		let frag = fragments[len];

		if( lastEnd && frag.start >= lastStart && frag.end <= lastEnd ) {
			if( !groupFrag.subFragments ) {
				groupFrag.subFragments = [];
			}
			groupFrag.subFragments.unshift(frag);
			fragments.splice(len, 1);
		}
		else {
			lastStart = frag.start;
			lastEnd = frag.end;
			groupFrag = frag;
		}
	}

    var outsStr = "", outs = [];

    var clearPos = 0
		, pos = 0
		, posOffset = 0//(__offsetObject ? __offsetObject.posOffset | 0 : 0)
		, posInnerOffset = 0
		, posInnerOffsetAdd = 0
	;
	var currentOffsets = offsets.slice();

	function __getCOFMAP(t) {
		if( t ) {
			return "\n=[" + currentOffsets.map(function(v, i, a){ var g = __OFFFF[i+1000];return [i, " ", v, " ", g] }).filter(function(a){return !!a[1]} ).join("]\n[") + "]"
		}
		else {
			return "\n=[" + offsets.map(function(v, i, a){ var g = __OFFFF[i+1000];return [i, " ", v, " ", g] }).filter(function(a){return !!a[1]} ).join("]\n[") + "]"
		}
	}

    for (var i = 0; i < fragments.length; i++) {
        var frag = fragments[i];

		var $__0 = getPositionsWithOffset(currentOffsets, frag.start, frag.end);
	    var from = $__0[0], to = $__0[1];

	    assert(
		    pos <= from
			|| from === to//nothing to remove
			, "'pos' (" + pos + ") shoulde be lq 'start' (" + from + ") or 'start' (" + from + ") equal 'end' (" + to + ")"
        );
        assert(from <= to);

		if( frag.subFragments ) {
			let offsetObject = { posInnerOffset: 0, posOffset: posOffset};
			this.offsets = offsets.slice();
			outsStr += outs.join("");
//			console.log("||====||", c			console.log("||====||", currentOffsets, from, "|", to, " || ", posOffset);
//			console.log("||1||[", outsStr + "]|[" + sourceString.slice(pos + posOffset, from) + "]|[" + sourceString.slice(from, to) + "]|[" + sourceString.substring(to) + "]|",  "|||");
			sourceString = this.alter(
				outsStr + sourceString.slice(pos, from) + sourceString.slice(from, to) + sourceString.substring(to)
				, frag.subFragments
				, offsetObject
			);
//			console.log("pos = " + pos, " | offsetPos = " + offsetPos )
			let offsetPos = getPositionsWithOffset(offsets, 0, clearPos)[1];
			posOffset = offsetPos - pos + posOffset;
			pos = offsetPos;
			let _posInnerOffsetAdd = 0;

			this.offsets.forEach(function(v, index) {
				if(index >= offsetPos) {
//					console.log(" >>>>>offsetPos=", offsetPos, "|pos=", pos, "/posOffset=", posOffset, "/posInnerOffset=", posInnerOffset, ">>>>> ", index, v, __OFFFF[index + 1000], "|", index - posOffset - posInnerOffset)
//					console.log("-----------", index, posOffset, posInnerOffset, "|", v)
//					console.log(currentOffsets, offsets)
//					console.log(__OFFFF);
//					console.log(__getCOFMAP(1));
//					console.log(__getCOFMAP());
//					if((index - posOffset - posInnerOffset) != index){console.log("AAAAAAAAAAA");__OFFFF[index - posOffset - posInnerOffset + 1000] = __OFFFF[index + 1000];delete __OFFFF[index + 1000];}
//					delete offsets[index];

					offsets[index - posOffset - posInnerOffset] = v;
					if( v - (v | 0) === .5 ) {//adding
						_posInnerOffsetAdd += (v | 0);
					}
				}
				else {
//					console.log(" <<<<<<<<< ", index, v, __OFFFF[index + 1000], index - posOffset - posInnerOffset)
				}
			});
//			console.log("posInnerOffsetAdd = ", posInnerOffsetAdd)
			posInnerOffset += _posInnerOffsetAdd;
			posInnerOffsetAdd += _posInnerOffsetAdd;
			if( offsetObject ) {
				posInnerOffset -= offsetObject.posInnerOffset;
				posInnerOffsetAdd -= offsetObject.posInnerOffset;
				console.log(posInnerOffset)
//				posOffset = offsetObject.posOffset;
			}
			this.offsets = offsets;
			currentOffsets = offsets.slice();
			$__0 = getPositionsWithOffset(currentOffsets, frag.start, frag.end);
			from = $__0[0];
			to = $__0[1];
			outs = [];
		}

		let string = frag.str.replace(this.uniqueRE, function(str, from, to) {
			to |= 0;

			var $__0 = getPositionsWithOffset(currentOffsets, from | 0, to);
			console.log("==-> ", from, to, $__0[0], $__0[1], sourceString.substring($__0[0], $__0[1]));

			return sourceString.substring($__0[0], $__0[1]);
		});

		if( typeof frag.transform === "function" ) {
			string = frag.transform.call(frag, string);
		}

		let offset = string.length - ( to - from );
		if( offset ) {
			let newIndex = from - posOffset - posInnerOffset
				, value = offsets[newIndex] || 0
			;

			value += offset;
			if( to === from ) {
				value += 0.5;
			}
			if( newIndex < 0) {
				console.log("ERRORRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR", frag)
				console.log("~", from - posOffset - posInnerOffset, " = ", from, posOffset, posInnerOffset, "|", offset, to, from, "|", string)
			}

			offsets[newIndex] = value;

			__OFFFF[newIndex + 1000] = string;
		}

//		if( from == 130) {
//			console.log(__getCOFMAP(1))
//			console.log(string, from)
//			console.log(sourceString.slice(from, to))
//		}
//
//		if( sourceString.slice(pos, from).indexOf("$2 = 4") != -1) {
//			console.log("QQQQQQQQQQ", sourceString.slice(pos, from), pos, to, from, frag)
//		}

		outs.push(sourceString.slice(pos, from));
		outs.push(string);

        pos = to;
	    clearPos = frag.end;
    }
    if (pos < sourceString.length) {
        outs.push(sourceString.slice(pos));
    }

	if( __offsetObject ) {
		__offsetObject.posInnerOffset = posInnerOffsetAdd;
		__offsetObject.posOffset = posOffset;
	}
//	console.log("posInnerOffset = ", posInnerOffset)
//	if(!__offsetObject)outs.forEach(function(a){
//		console.log("'" + a + "'")
//	})

    return outsStr + outs.join("");
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = alter;
}
