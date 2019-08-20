"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function verifyVersionBump(version, tagNames) {
    for (const tagName of tagNames) {
        if (version === tagName) {
            return false;
        }
    }
    return true;
}
exports.default = verifyVersionBump;
