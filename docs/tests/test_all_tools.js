'use strict';

console.log("");
console.log("Testing HTML character escaping");
let test_escape_html_chars = require('../tests/test_escape_html_chars');

console.log("");
console.log("Testing Mustaches style template expander");
let test_mustache_expander = require('../tests/test_mustache_expander');

console.log("");
console.log("Testing Lucene parser");
let test_lucene = require('../tests/test_lucene');

process.exit();
