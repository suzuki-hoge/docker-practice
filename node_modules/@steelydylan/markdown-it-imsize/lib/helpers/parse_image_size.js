"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseImageSize = void 0;
function parseNextNumber(str, pos, max) {
    var code;
    var start = pos;
    var result = {
        ok: false,
        pos: pos,
        value: ''
    };
    code = str.charCodeAt(pos);
    while (pos < max && (code >= 0x30 /* 0 */ && code <= 0x39 /* 9 */) || code === 0x25 /* % */) {
        code = str.charCodeAt(++pos);
    }
    result.ok = true;
    result.pos = pos;
    result.value = str.slice(start, pos);
    return result;
}
function parseImageSize(str, pos, max) {
    var code = str.charCodeAt(pos);
    var result = {
        ok: false,
        pos: 0,
        width: '',
        height: ''
    };
    if (pos >= max) {
        return result;
    }
    if (code !== 0x3d /* = */) {
        return result;
    }
    pos++;
    // size must follow = without any white spaces as follows
    // (1) =300x200
    // (2) =300x
    // (3) =x200
    code = str.charCodeAt(pos);
    if (code !== 0x78 /* x */ && (code < 0x30 || code > 0x39) /* [0-9] */) {
        return result;
    }
    // parse width
    var resultW = parseNextNumber(str, pos, max);
    pos = resultW.pos;
    // next charactor must be 'x'
    code = str.charCodeAt(pos);
    if (code !== 0x78 /* x */) {
        return result;
    }
    pos++;
    // parse height
    var resultH = parseNextNumber(str, pos, max);
    pos = resultH.pos;
    result.width = resultW.value;
    result.height = resultH.value;
    result.pos = pos;
    result.ok = true;
    return result;
}
exports.parseImageSize = parseImageSize;
;
