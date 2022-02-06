"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mdCustomBlock = void 0;
var utils_1 = require("markdown-it/lib/common/utils");
var helper_1 = require("./helper");
var url_matcher_1 = require("./url-matcher");
// e.g. @[youtube](youtube-video-id)
var blockOptions = {
    youtube: function (videoId) {
        if (!(videoId === null || videoId === void 0 ? void 0 : videoId.match(/^[a-zA-Z0-9_-]+$/))) {
            return 'YouTubeのvideoIDが不正です';
        }
        return (0, helper_1.generateYoutubeHtmlFromVideoId)(videoId);
    },
    slideshare: function (key) {
        if (!(key === null || key === void 0 ? void 0 : key.match(/^[a-zA-Z0-9_-]+$/))) {
            return 'Slide Shareのkeyが不正です';
        }
        return "<div class=\"embed-slideshare\"><iframe src=\"https://www.slideshare.net/slideshow/embed_code/key/".concat((0, utils_1.escapeHtml)(key), "\" scrolling=\"no\" allowfullscreen loading=\"lazy\"></iframe></div>");
    },
    speakerdeck: function (key) {
        if (!(key === null || key === void 0 ? void 0 : key.match(/^[a-zA-Z0-9_-]+$/))) {
            return 'Speaker Deckのkeyが不正です';
        }
        return "<div class=\"embed-speakerdeck\"><iframe src=\"https://speakerdeck.com/player/".concat((0, utils_1.escapeHtml)(key), "\" scrolling=\"no\" allowfullscreen allow=\"encrypted-media\" loading=\"lazy\"></iframe></div>");
    },
    jsfiddle: function (str) {
        if (!(0, url_matcher_1.isJsfiddleUrl)(str)) {
            return 'jsfiddleのURLが不正です';
        }
        // URLを~/embedded/とする
        // ※ すでにembeddedもしくはembedが含まれるURLが入力されている場合は、そのままURLを使用する。
        var url = str;
        if (!url.includes('embed')) {
            url = url.endsWith('/') ? "".concat(url, "embedded/") : "".concat(url, "/embedded/");
        }
        return "<div class=\"embed-jsfiddle\"><iframe src=\"".concat(url, "\" scrolling=\"no\" frameborder=\"no\" allowfullscreen allowtransparency=\"true\" loading=\"lazy\"></iframe></div>");
    },
    codepen: function (str) {
        if (!(0, url_matcher_1.isCodepenUrl)(str)) {
            return 'CodePenのURLが不正です';
        }
        var url = new URL(str.replace('/pen/', '/embed/'));
        url.searchParams.set('embed-version', '2');
        return "<div class=\"embed-codepen\"><iframe src=\"".concat(url, "\" scrolling=\"no\" scrolling=\"no\" frameborder=\"no\" allowtransparency=\"true\" loading=\"lazy\"></iframe></div>");
    },
    codesandbox: function (str) {
        if (!(0, url_matcher_1.isCodesandboxUrl)(str)) {
            return '「https://codesandbox.io/embed/」から始まる正しいURLを入力してください';
        }
        return "<div class=\"embed-codesandbox\"><iframe src=\"".concat(str, "\" style=\"width:100%;height:500px;border:none;overflow:hidden;\" allow=\"accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking\" loading=\"lazy\" sandbox=\"allow-modals allow-forms allow-popups allow-scripts allow-same-origin\"></iframe></div>");
    },
    stackblitz: function (str) {
        if (!(0, url_matcher_1.isStackblitzUrl)(str)) {
            return 'StackBlitzのembed用のURLを指定してください';
        }
        return "<div class=\"embed-stackblitz\"><iframe src=\"".concat(str, "\" scrolling=\"no\" frameborder=\"no\" allowtransparency=\"true\" loading=\"lazy\" allowfullscreen></iframe></div>");
    },
    tweet: function (str) {
        if (!(0, url_matcher_1.isTweetUrl)(str))
            return 'ツイートページのURLを指定してください';
        return (0, helper_1.generateTweetHtml)(str);
    },
    card: function (str) {
        // generateCardHtml内でURLはエンコードされるためここでのバリデーションは軽めでOK
        if (!(0, helper_1.isValidHttpUrl)(str))
            return 'URLが不正です';
        return (0, helper_1.generateCardHtml)(str);
    },
    gist: function (str) {
        if (!(0, url_matcher_1.isGistUrl)(str))
            return 'GitHub GistのページURLを指定してください';
        /**
         * gistのURL は
         * - https://gist.github.com/foo/bar.json
         * - https://gist.github.com/foo/bar.json?file=example.js
         * のような形式
         */
        var _a = str.split('?file='), pageUrl = _a[0], file = _a[1];
        return "<div class=\"embed-gist\"><embed-gist page-url=\"".concat(pageUrl, "\" encoded-filename=\"").concat(file ? encodeURIComponent(file) : '', "\" /></div>");
    },
};
// Forked from: https://github.com/posva/markdown-it-custom-block
function mdCustomBlock(md) {
    md.renderer.rules.custom = function tokenizeBlock(tokens, idx) {
        // eslint-disable-next-line
        var _a = tokens[idx].info, tag = _a.tag, arg = _a.arg;
        if (!tag || !arg)
            return '';
        try {
            // eslint-disable-next-line
            return blockOptions[tag](arg) + '\n';
        }
        catch (e) {
            return '';
        }
    };
    md.block.ruler.before('fence', 'custom', function customEmbed(state, startLine, endLine, silent) {
        var startPos = state.bMarks[startLine] + state.tShift[startLine];
        var maxPos = state.eMarks[startLine];
        var block = state.src.slice(startPos, maxPos);
        var pointer = { line: startLine, pos: startPos };
        // Note: skip prev line break check
        // if (startLine !== 0) {
        //   let prevLineStartPos =
        //     state.bMarks[startLine - 1] + state.tShift[startLine - 1];
        //   let prevLineMaxPos = state.eMarks[startLine - 1];
        //   if (prevLineMaxPos > prevLineStartPos) return false;
        // }
        // Check if it's @[tag](arg)
        if (state.src.charCodeAt(pointer.pos) !== 0x40 /* @ */ ||
            state.src.charCodeAt(pointer.pos + 1) !== 0x5b /* [ */) {
            return false;
        }
        var embedRE = /@\[([\w-]+)\]\((.+)\)/im;
        var match = embedRE.exec(block);
        if (!match || match.length < 3) {
            return false;
        }
        var all = match[0], tag = match[1], arg = match[2];
        pointer.pos += all.length;
        // Note: skip nextline break check
        // if (endLine !== pointer.line + 1) {
        //   let nextLineStartPos =
        //     state.bMarks[pointer.line + 1] + state.tShift[pointer.line + 1];
        //   let nextLineMaxPos = state.eMarks[pointer.line + 1];
        //   if (nextLineMaxPos > nextLineStartPos) return false;
        // }
        if (pointer.line >= endLine)
            return false;
        if (!silent) {
            var token = state.push('custom', 'div', 0);
            token.markup = state.src.slice(startPos, pointer.pos);
            // eslint-disable-next-line
            token.info = { arg: arg, tag: tag };
            token.block = true;
            token.map = [startLine, pointer.line + 1];
            state.line = pointer.line + 1;
        }
        return true;
    }, { alt: ['paragraph', 'reference', 'blockquote', 'list'] });
}
exports.mdCustomBlock = mdCustomBlock;
