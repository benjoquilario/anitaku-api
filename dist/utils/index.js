"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.substringBefore = exports.substringAfter = exports.days = exports.ACCEPT_HEADER = exports.ACCEPT_ENCODING_HEADER = exports.USER_AGENT = void 0;
exports.USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36";
exports.ACCEPT_ENCODING_HEADER = "gzip, deflate, br";
exports.ACCEPT_HEADER = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9";
exports.days = [
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
];
function substringAfter(str, toFind) {
    const index = str.indexOf(toFind);
    return index == -1 ? "" : str.substring(index + toFind.length);
}
exports.substringAfter = substringAfter;
function substringBefore(str, toFind) {
    const index = str.indexOf(toFind);
    return index == -1 ? "" : str.substring(0, index);
}
exports.substringBefore = substringBefore;
//# sourceMappingURL=index.js.map