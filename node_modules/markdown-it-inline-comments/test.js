'use strict';

var path     = require('path');
var generate = require('markdown-it-testgen');

/*eslint-env mocha*/


var md = require('markdown-it')()
            .use(require('./'));

var result = md.render('testing <!-- comments --> in the markdown');
console.log(result);
