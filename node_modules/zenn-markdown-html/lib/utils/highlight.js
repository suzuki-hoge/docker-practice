"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.highlight = void 0;
var prismjs_1 = __importDefault(require("prismjs"));
var utils_1 = require("markdown-it/lib/common/utils");
var components_1 = __importDefault(require("prismjs/components/"));
var prism_diff_highlight_1 = require("../prism-plugins/prism-diff-highlight");
// diffプラグインを有効化
(0, prism_diff_highlight_1.enableDiffHighlight)();
function loadPrismGrammer(lang) {
    if (!lang)
        return undefined;
    var langObject = prismjs_1.default.languages[lang];
    if (langObject === undefined) {
        (0, components_1.default)([lang]);
        langObject = prismjs_1.default.languages[lang];
    }
    return langObject;
}
function highlightContent(_a) {
    var text = _a.text, prismGrammer = _a.prismGrammer, langName = _a.langName, hasDiff = _a.hasDiff;
    if (prismGrammer && langName) {
        if (hasDiff)
            return prismjs_1.default.highlight(text, prismjs_1.default.languages.diff, "diff-".concat(langName));
        return prismjs_1.default.highlight(text, prismGrammer, langName);
    }
    if (hasDiff)
        return prismjs_1.default.highlight(text, prismjs_1.default.languages.diff, 'diff');
    return (0, utils_1.escapeHtml)(text);
}
function highlight(text, langName, hasDiff) {
    var prismGrammer = loadPrismGrammer(langName);
    return highlightContent({ text: text, prismGrammer: prismGrammer, langName: langName, hasDiff: hasDiff });
}
exports.highlight = highlight;
