"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enableDiffHighlight = void 0;
var prismjs_1 = __importDefault(require("prismjs"));
var components_1 = __importDefault(require("prismjs/components/"));
/**
 * PrismJSのDiff構文を使用できるようにするためのプラグイン
 * ソースコードの大部分は、以下のファイルより抜き出したもの
 * @reference https://github.com/PrismJS/prism/blob/master/plugins/diff-highlight/prism-diff-highlight.js
 */
function enableDiffHighlight() {
    // this plugin needs to load `diff`
    (0, components_1.default)('diff');
    var LANGUAGE_REGEX = /^diff-([\w-]+)/i;
    var HTML_TAG = /<\/?(?!\d)[^\s>/=$<%]+(?:\s(?:\s*[^\s>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/gi;
    //this will match a line plus the line break while ignoring the line breaks HTML tags may contain.
    var HTML_LINE = RegExp(/(?:__|[^\r\n<])*(?:\r\n?|\n|(?:__|[^\r\n<])(?![^\r\n])(?:__)?)(?:__)?/.source.replace(/__/g, function () {
        return HTML_TAG.source;
    }), 'gi');
    var warningLogged = false;
    prismjs_1.default.hooks.add('before-sanity-check', function (env) {
        var lang = env.language;
        if (LANGUAGE_REGEX.test(lang) && !env.grammar) {
            env.grammar = prismjs_1.default.languages[lang] = prismjs_1.default.languages.diff;
        }
    });
    prismjs_1.default.hooks.add('before-tokenize', function (env) {
        if (!warningLogged && !prismjs_1.default.languages.diff && !prismjs_1.default.plugins.autoloader) {
            warningLogged = true;
            console.warn("Prism's Diff Highlight plugin requires the Diff language definition (prism-diff.js)." +
                "Make sure the language definition is loaded or use Prism's Autoloader plugin.");
        }
        var lang = env.language;
        if (LANGUAGE_REGEX.test(lang) && !prismjs_1.default.languages[lang]) {
            prismjs_1.default.languages[lang] = prismjs_1.default.languages.diff;
        }
    });
    prismjs_1.default.hooks.add('wrap', function (env) {
        var diffLanguage = '', diffGrammar;
        if (env.language !== 'diff') {
            var langMatch = LANGUAGE_REGEX.exec(env.language);
            if (!langMatch) {
                return; // not a language specific diff
            }
            diffLanguage = langMatch[1];
            diffGrammar = prismjs_1.default.languages[diffLanguage];
        }
        /**
         * A map from the name of a block to its line prefix, same as `Prism.languages.diff.PREFIXES`
         *
         * @type {Object<string, string>}
         */
        var DIFF_PREFIXES = {
            'deleted-sign': '-',
            'deleted-arrow': '<',
            'inserted-sign': '+',
            'inserted-arrow': '>',
            unchanged: ' ',
            diff: '!',
        };
        var PREFIXES = prismjs_1.default.languages.diff && DIFF_PREFIXES;
        // one of the diff tokens without any nested tokens
        if (PREFIXES && env.type in PREFIXES) {
            /** @type {string} */
            var content = env.content.replace(HTML_TAG, ''); // remove all HTML tags
            /** @type {string} */
            var decoded = content.replace(/&lt;/g, '<').replace(/&amp;/g, '&');
            // remove any one-character prefix
            var code = decoded.replace(/(^|[\r\n])./g, '$1');
            // highlight, if possible
            var highlighted = void 0;
            if (diffLanguage && diffGrammar) {
                highlighted = prismjs_1.default.highlight(code, diffGrammar, diffLanguage);
            }
            else {
                highlighted = prismjs_1.default.util.encode(code);
            }
            // get the HTML source of the prefix token
            var prefixToken = new prismjs_1.default.Token('prefix', PREFIXES[env.type], [/\w+/.exec(env.type)[0]]);
            var prefix = prismjs_1.default.Token.stringify(prefixToken, env.language);
            // add prefix
            var lines = [];
            var m = void 0;
            HTML_LINE.lastIndex = 0;
            while ((m = HTML_LINE.exec(highlighted))) {
                lines.push(prefix + m[0]);
            }
            if (/(?:^|[\r\n]).$/.test(decoded)) {
                // because both "+a\n+" and "+a\n" will map to "a\n" after the line prefixes are removed
                lines.push(prefix);
            }
            env.content = lines.join('');
            if (diffGrammar) {
                env.classes.push('language-' + diffLanguage);
            }
        }
    });
}
exports.enableDiffHighlight = enableDiffHighlight;
