"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mdLinkifyToCard = void 0;
var url_matcher_1 = require("./url-matcher");
var helper_1 = require("./helper");
var token_1 = __importDefault(require("markdown-it/lib/token"));
function convertAutolinkToEmbed(inlineChildTokens) {
    var newTokens = [];
    inlineChildTokens.forEach(function (token, i) {
        // 埋め込み対象となるlink_open かつ linkify以外はそのまま出力結果に含める
        if (!(token.type === 'link_open' && token.markup === 'linkify')) {
            newTokens.push(token); // 変換は行わずに出力結果に含める
            return;
        }
        var linkOpenToken = token;
        // tokenがlinkifyの場合は必要に応じて、カードを生成
        var url = linkOpenToken.attrGet('href');
        if (!url) {
            newTokens.push(token); // 変換は行わずに出力結果に含める
            return;
        }
        var isStartOfLine = i === 0;
        var isEndOfLine = i + 2 === inlineChildTokens.length - 1; // i + 2 = link_closeのこと => link_closeが最後のtokenか
        var prevToken = isStartOfLine ? null : inlineChildTokens[i - 1]; // e.g. [✋, link_open, text, link_close]
        var nextToken = isEndOfLine ? null : inlineChildTokens[i + 3]; // e.g. [text, link_open, text, link_close, ✋]
        var isPrevBr = (prevToken === null || prevToken === void 0 ? void 0 : prevToken.tag) === 'br';
        var isNextBr = (nextToken === null || nextToken === void 0 ? void 0 : nextToken.tag) === 'br';
        // 以下の2つをどちらも満たした場合にリンク化
        // 1. パラグラフ先頭 もしくは リンクの前が br
        // 2. パラグラフの末尾 もしくは リンクの後が br
        var shouldConvertToCard = (isStartOfLine || isPrevBr) && (isEndOfLine || isNextBr);
        if (!shouldConvertToCard) {
            newTokens.push(token); // 変換は行わずに出力結果に含める
            return;
        }
        // 埋め込み用のHTMLを生成
        var embedToken = new token_1.default('html_inline', '', 0);
        if ((0, url_matcher_1.isTweetUrl)(url)) {
            embedToken.content = (0, helper_1.generateTweetHtml)(url);
        }
        else if ((0, url_matcher_1.isYoutubeUrl)(url)) {
            embedToken.content = (0, helper_1.generateYoutubeHtmlFromUrl)(url);
        }
        else {
            embedToken.content = (0, helper_1.generateCardHtml)(url);
        }
        // a要素自体はカードにより不要になるため非表示に
        linkOpenToken.attrJoin('style', 'display: none');
        // カードとリンクのトークンを出力結果のtokenに追加
        newTokens.push(embedToken, linkOpenToken);
        // 前後のbrタグはスペースを広げすぎてしまうため非表示にしておく
        if (nextToken && isNextBr) {
            nextToken.type = 'html_inline';
            nextToken.content = '<br style="display: none">\n';
        }
        if (prevToken && isPrevBr) {
            prevToken.type = 'html_inline';
            prevToken.content = '<br style="display: none">\n';
        }
    });
    return newTokens;
}
function mdLinkifyToCard(md) {
    md.core.ruler.after('replacements', 'link-to-card', function (_a) {
        var tokens = _a.tokens;
        // 本文内のすべてのtokenをチェック
        tokens.forEach(function (token, i) {
            // autolinkはinline内のchildrenにのみ存在
            if (token.type !== 'inline')
                return;
            // childrenが存在しない場合は変換しない
            var children = token.children;
            if (!children)
                return;
            // childrenにautolinkが存在する場合のみ変換
            var hasAnyAutolink = children === null || children === void 0 ? void 0 : children.some(function (child) { return child.markup === 'linkify'; });
            if (!hasAnyAutolink)
                return;
            // 親がコンテンツ直下のp要素の場合のみ変換
            var parentToken = tokens[i - 1];
            var isParentRootParagraph = parentToken &&
                parentToken.type === 'paragraph_open' &&
                parentToken.level === 0;
            if (!isParentRootParagraph)
                return;
            token.children = convertAutolinkToEmbed(children);
        });
        return true;
    });
}
exports.mdLinkifyToCard = mdLinkifyToCard;
