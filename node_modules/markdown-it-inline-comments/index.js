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
