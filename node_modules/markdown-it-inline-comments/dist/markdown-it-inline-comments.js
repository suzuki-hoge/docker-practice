/*! markdown-it-inline-comments 1.0.1 https://github.com/jay-hodgson/markdown-it-inline-comments @license MIT */(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.markdownitInlineComments = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Process <!-- comments -->

'use strict';

function inlinecomment(state, silent) {
  var found,
      content,
      max = state.posMax,
      start = state.pos;

  if (silent) { return false; } // don't run any pairs in validation mode
  if (start + 7 >= max) { return false; }

  if (state.src.charCodeAt(start) !== 60 /* < */ ||
      state.src.charCodeAt(start + 1) !== 33 /* ! */ ||
      state.src.charCodeAt(start + 2) !== 45/* - */ ||
      state.src.charCodeAt(start + 3) !== 45/* - */
      ) {
    return false;
  }
  state.pos = start + 4;

  // find the end
  while (state.pos + 3 <= max) {
    if (state.src.charCodeAt(state.pos) === 45/* - */ &&
        state.src.charCodeAt(state.pos + 1) === 45/* - */ &&
        state.src.charCodeAt(state.pos + 2) === 62/* > */
    ) {
      found = true;
      state.pos = state.pos + 3;
      break;
    }

    state.md.inline.skipToken(state);
  }

  if (!found || start + 1 === state.pos) {
    state.pos = start;
    return false;
  }

  content = state.src.slice(start + 4, state.pos);

  // don't allow unescaped newlines inside
  if (content.match(/(^|[^\\])(\\\\)*[\n]/)) {
    state.pos = start;
    return false;
  }
  return true;
}

module.exports = function inline_comment_plugin(md) {
  md.inline.ruler.after('emphasis', 'inlinecomment', inlinecomment);
};

},{}]},{},[1])(1)
});