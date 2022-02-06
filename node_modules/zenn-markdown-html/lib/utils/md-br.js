"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mdBr = void 0;
/**
 * Return case-sensitive matched br tag
 * @param {any} state MarkdownIt state
 * @param {number} start start position at br tag
 * @returns {string | null} br tag (<br> or <br/> or <br />)
 */
// eslint-disable-next-line
function matchBR(state, start) {
    var match = state.src.slice(start, start + 6).match(/^<br\s?\/?>/);
    if (match) {
        return match[0];
    }
    return null;
}
function mdBr(md) {
    // Tokenize
    md.inline.ruler.before('emphasis', 'br', 
    // eslint-disable-next-line
    function tokenize(state, silent) {
        var max = state.posMax;
        var start = state.pos;
        // don't run any pairs in validation mode
        if (silent) {
            return false;
        }
        var br = matchBR(state, start);
        if (br === null || start + br.length > max) {
            return false;
        }
        state.scanDelims(state.pos, true);
        var token = state.push('text', '', 0);
        token.content = '<br>';
        state.delimiters.push({
            marker: token.content,
            jump: 0,
            token: state.tokens.length - 1,
            level: state.level,
            end: -1,
            open: true,
            close: true,
        });
        // length is: <br> -> 4, <br/> -> 5, <br /> -> 6
        state.pos += br.length;
        return true;
    });
    // Walk through delimiter list and replace text tokens with tags
    md.inline.ruler2.before('emphasis', 'br', function postProcess(state) {
        var i;
        var delim;
        var token;
        var delimiters = state.delimiters;
        var max = state.delimiters.length;
        for (i = 0; i < max; i++) {
            delim = delimiters[i];
            var marker = delim.marker;
            if (marker === '<br>') {
                token = state.tokens[delim.token];
                token.type = 'br_openclose';
                token.tag = 'br';
                token.nesting = 1;
                token.markup = '<br>';
                token.content = '';
            }
        }
        return true;
    });
}
exports.mdBr = mdBr;
