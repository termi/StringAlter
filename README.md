# StringAlter.js
Alters a string by replacing multiple range fragments in one fast pass.
Works in node and browsers.



## Usage
```javascript
    var StringAlter = require("StringAlter");

    var alter = new StringAlter("0123456789");
    alter
    	.repalce(1, 3, "first")
    	.repalce(5, 9, "second")
    	.apply() // => "0first34second9"
    ;
```

The fragments does not need to be sorted but must not overlap. More examples in `test/alter-tests.js`

## API

```javascript
alter.replace(from: number, to: number, str: string)
```
Replace substring from between "from" and "to" positions to given one "str"

```javascript
alter.insert(pos: number, str: string)
```
Insert substring to "pos" position

```javascript
alter.wrap(from: number, to: number, begin: string, end: string)
```
Insert "begin" string to "from" position and "end" string to "to" position

```javascript
alter.apply()
```
Apply changes. Return result string


## Installation

Clone the repo and include it in a script tag

    git clone https://github.com/termi/StringAlter.git

```html
<script src="StringAlter/dist/StringAlter.js"></script>
```

## LICENSE

MIT
