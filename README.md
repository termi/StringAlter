# alter.js
Alters a string by replacing multiple range fragments in one fast pass.
Works in node and browsers.



## Usage
```javascript
    var StringAlter = require("StringAlter");

    var alter = StringAlter("0123456789");
    alter
    	.repalce(1, 3, "first")
    	.repalce(5, 9, "second")
    	.apply() // => "0first34second9"
    ;
```

The fragments does not need to be sorted but must not overlap. More examples in `test/alter-tests.js`


## Installation

Clone the repo and include it in a script tag

    git clone https://github.com/termi/StringAlter.git

```html
<script src="StringAlter/dist/StringAlter.js"></script>
```
