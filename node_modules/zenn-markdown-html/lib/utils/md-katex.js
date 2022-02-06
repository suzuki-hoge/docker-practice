"use strict";
/**
 * forked from https://github.com/goessner/markdown-it-mdKatex
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mdKatex = void 0;
var katexClassName = 'zenn-katex';
var preHandler = function (str, beg) {
    var prv = beg > 0 ? str[beg - 1].charCodeAt(0) : false;
    return (!prv ||
        (prv !== 0x5c && // no backslash,
            (prv < 0x30 || prv > 0x39))); // no decimal digit .. before opening '$'
};
var postHandler = function (str, end) {
    var nxt = str[end + 1] && str[end + 1].charCodeAt(0);
    return !nxt || nxt < 0x30 || nxt > 0x39; // no decimal digit .. after closing '$'
};
var inlineRules = [
    {
        name: 'math_inline_double',
        // maybe unused.
        rex: /\${2}((?:\S)|(?:\S(?!.*\]\(http).*?\S))\${2}/gy,
        tmpl: "<section class=\"".concat(katexClassName, "\"><embed-katex display-mode=\"1\"><eqn>$1</eqn></embed-katex></section>"),
        tag: '$$',
        pre: preHandler,
        post: postHandler,
    },
    {
        name: 'math_inline',
        // fixed so that the expression [$something](https://something.com/$example) is skipped.
        // (?:\S(?![^$]*\]\(http.*) means something like "](https://hoge.com/hoge)"
        rex: /\$((?:\S)|(?:\S(?![^$]*\]\(http.*).*?\S))\$/gy,
        tmpl: "<embed-katex><eq class=\"".concat(katexClassName, "\">$1</eq></embed-katex>"),
        tag: '$',
        pre: preHandler,
        post: postHandler,
    },
];
var blockRules = [
    {
        name: 'math_block_eqno',
        rex: /\${2}([^$]+?)\${2}\s*?\(([^)\s]+?)\)/gmy,
        tmpl: "<section class=\"".concat(katexClassName, " eqno\"><eqn><embed-katex display-mode=\"1\">$1</embed-katex></eqn><span>($2)</span></section>"),
        tag: '$$',
    },
    {
        name: 'math_block',
        rex: /\${2}([^$]+?)\${2}/gmy,
        tmpl: "<section class=\"".concat(katexClassName, "\"><eqn><embed-katex display-mode=\"1\">$1</embed-katex></eqn></section>"),
        tag: '$$',
    },
];
function mdKatex(md) {
    var _loop_1 = function (rule) {
        md.inline.ruler.before('escape', rule.name, function (state, silent) {
            var pos = state.pos;
            var str = state.src;
            var pre = str.startsWith(rule.tag, (rule.rex.lastIndex = pos)) &&
                (!rule.pre || rule.pre(str, pos)); // valid pre-condition ...
            var match = pre && rule.rex.exec(str);
            var res = !!match &&
                pos < rule.rex.lastIndex &&
                (!rule.post || rule.post(str, rule.rex.lastIndex - 1));
            if (res) {
                if (!silent && match) {
                    var token = state.push(rule.name, 'math', 0);
                    token.content = match[1];
                    token.markup = rule.tag;
                }
                state.pos = rule.rex.lastIndex;
            }
            return res;
        }); // ! important
        md.renderer.rules[rule.name] = function (tokens, idx) {
            return rule.tmpl.replace(/\$1/, md.utils.escapeHtml(tokens[idx].content));
        };
    };
    for (var _i = 0, inlineRules_1 = inlineRules; _i < inlineRules_1.length; _i++) {
        var rule = inlineRules_1[_i];
        _loop_1(rule);
    }
    var _loop_2 = function (rule) {
        md.block.ruler.before('fence', rule.name, function block(state, begLine, endLine, silent) {
            var pos = state.bMarks[begLine] + state.tShift[begLine];
            var str = state.src;
            var pre = str.startsWith(rule.tag, (rule.rex.lastIndex = pos)) &&
                (!rule.pre || rule.pre(str, pos)); // valid pre-condition ....
            var match = pre && rule.rex.exec(str);
            var res = !!match &&
                pos < rule.rex.lastIndex &&
                (!rule.post || rule.post(str, rule.rex.lastIndex - 1));
            if (res && !silent && match) {
                // match and valid post-condition ...
                var endpos = rule.rex.lastIndex - 1;
                var curline = void 0;
                for (curline = begLine; curline < endLine; curline++)
                    if (endpos >= state.bMarks[curline] + state.tShift[curline] &&
                        endpos <= state.eMarks[curline])
                        // line for end of block math found ...
                        break;
                // "this will prevent lazy continuations from ever going past our end marker"
                // s. https://github.com/markdown-it/markdown-it-container/blob/master/index.js
                var lineMax = state.lineMax;
                var oldParentType = state.parentType;
                state.lineMax = curline;
                // eslint-disable-next-line
                state.parentType = 'math';
                if (oldParentType === 'blockquote') {
                    // remove all leading '>' inside multiline formula
                    match[1] = match[1].replace(/(\n*?^(?:\s*>)+)/gm, '');
                }
                // begin token
                var token = state.push(rule.name, 'math', 1); // 'math_block'
                token.block = true;
                token.markup = rule.tag;
                token.content = match[1];
                token.info = match[match.length - 1]; // eq.no
                token.map = [begLine, curline];
                // end token
                token = state.push(rule.name + '_end', 'math', -1);
                token.block = true;
                token.markup = rule.tag;
                state.parentType = oldParentType;
                state.lineMax = lineMax;
                state.line = curline + 1;
            }
            return res;
        }); // ! important for ```math delimiters
        md.renderer.rules[rule.name] = function (tokens, idx) {
            return rule.tmpl
                .replace(/\$2/, md.utils.escapeHtml(tokens[idx].info)) // equation number .. ?
                .replace(/\$1/, md.utils.escapeHtml(tokens[idx].content));
        };
    };
    for (var _a = 0, blockRules_1 = blockRules; _a < blockRules_1.length; _a++) {
        var rule = blockRules_1[_a];
        _loop_2(rule);
    }
}
exports.mdKatex = mdKatex;
