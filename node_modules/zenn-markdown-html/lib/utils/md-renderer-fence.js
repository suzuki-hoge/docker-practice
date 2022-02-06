"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mdRendererFence = exports.parseInfo = void 0;
var utils_1 = require("markdown-it/lib/common/utils");
var highlight_1 = require("./highlight");
function getHtml(_a) {
    var content = _a.content, className = _a.className, fileName = _a.fileName;
    var escapedClass = (0, utils_1.escapeHtml)(className);
    return "<div class=\"code-block-container\">".concat(fileName
        ? "<div class=\"code-block-filename-container\"><span class=\"code-block-filename\">".concat((0, utils_1.escapeHtml)(fileName), "</span></div>")
        : '', "<pre class=\"").concat(escapedClass, "\"><code class=\"").concat(escapedClass, "\">").concat(content, "</code></pre></div>");
}
function getClassName(_a) {
    var _b = _a.langName, langName = _b === void 0 ? '' : _b, hasDiff = _a.hasDiff;
    var isSafe = /^[\w-]{0,30}$/.test(langName);
    if (!isSafe)
        return '';
    if (hasDiff) {
        return "diff-highlight ".concat(langName.length ? "language-diff-".concat(langName) : '');
    }
    return langName ? "language-".concat(langName) : '';
}
var fallbackLanguages = {
    vue: 'html',
    react: 'jsx',
    fish: 'shell',
    sh: 'shell',
    cwl: 'yaml',
    tf: 'hcl', // ref: https://github.com/PrismJS/prism/issues/1252
};
function normalizeLangName(str) {
    var _a;
    if (!(str === null || str === void 0 ? void 0 : str.length))
        return '';
    var langName = str.toLocaleLowerCase();
    return (_a = fallbackLanguages[langName]) !== null && _a !== void 0 ? _a : langName;
}
function parseInfo(str) {
    if (str.trim() === '') {
        return {
            langName: '',
            fileName: undefined,
            hasDiff: false,
        };
    }
    // e.g. foo:filename => ["foo", "filename"]
    // e.g. foo diff:filename => ["foo diff", "filename"]
    var _a = str.split(':'), langInfo = _a[0], fileName = _a[1];
    var langNames = langInfo.split(' ');
    var hasDiff = langNames.some(function (name) { return name === 'diff'; });
    var langName = hasDiff
        ? langNames.find(function (lang) { return lang !== 'diff'; })
        : langNames[0];
    return {
        langName: normalizeLangName(langName),
        fileName: fileName,
        hasDiff: hasDiff,
    };
}
exports.parseInfo = parseInfo;
function mdRendererFence(md) {
    // override fence
    md.renderer.rules.fence = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var tokens = args[0], idx = args[1];
        var _a = tokens[idx], info = _a.info, content = _a.content;
        var _b = parseInfo(info), langName = _b.langName, fileName = _b.fileName, hasDiff = _b.hasDiff;
        if (langName === 'mermaid') {
            return "<div class=\"embed-mermaid\"><embed-mermaid><pre class=\"zenn-mermaid\">".concat((0, utils_1.escapeHtml)(content.trim()), "</pre></embed-mermaid></div>");
        }
        var className = getClassName({
            langName: langName,
            hasDiff: hasDiff,
        });
        var highlightedContent = (0, highlight_1.highlight)(content, langName, hasDiff);
        return getHtml({
            content: highlightedContent,
            className: className,
            fileName: fileName,
        });
    };
}
exports.mdRendererFence = mdRendererFence;
