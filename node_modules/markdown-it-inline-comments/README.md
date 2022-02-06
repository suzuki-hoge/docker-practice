# markdown-it-inline-comments

[![Build Status](https://img.shields.io/travis/jay-hodgson/markdown-it-inline-comments/master.svg?style=flat)](https://travis-ci.org/jay-hodgson/markdown-it-inline-comments)
[![NPM version](https://img.shields.io/npm/v/markdown-it-inline-comments.svg?style=flat)](https://www.npmjs.org/package/markdown-it-inline-comments)
[![Coverage Status](https://img.shields.io/coveralls/jay-hodgson/markdown-it-inline-comments/master.svg?style=flat)](https://coveralls.io/r/jay-hodgson/markdown-it-inline-comments?branch=master)

> Center text plugin for [markdown-it](https://github.com/markdown-it/markdown-it) markdown parser.

__v1.+ requires `markdown-it` v4.+, see changelog.__

`Removes HTML comments <!-- like this -->` => `Removes HTML comments `

## Install

node.js, browser:

```bash
npm install markdown-it-inline-comments --save
bower install markdown-it-inline-comments --save
```

## Use

```js
var md = require('markdown-it')()
            .use(require('markdown-it-inline-comments'));

md.render('<!-- comments -->') // => ''

```

The widgetparams can be used to determine what kind of html widget should be rendered in the output container.

_Differences in browser._ If you load script directly into the page, without
package system, module will add itself globally as `window.markdownitInlineComments`.


## License
[MIT](https://github.com/jay-hodgson/markdown-it-inline-comments/blob/master/LICENSE)
