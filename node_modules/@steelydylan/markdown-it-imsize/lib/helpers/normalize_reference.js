"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeReference = void 0;
function normalizeReference(str) {
    return str.trim().replace(/\s+/g, ' ').toUpperCase();
}
exports.normalizeReference = normalizeReference;
;
