"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveServerId = exports.scrapeCard = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const scrapeCard = ($, baseUrl, selector) => {
    try {
        const results = [];
        $(selector).each((i, ele) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            const card = $(ele);
            const atag = card.find(".film-name a");
            const id = (_a = atag.attr("href")) === null || _a === void 0 ? void 0 : _a.split("/")[1].split("?")[0];
            const type = (_c = (_b = card
                .find(".fdi-item")) === null || _b === void 0 ? void 0 : _b.first()) === null || _c === void 0 ? void 0 : _c.text().replace(" (? eps)", "").replace(/\s\(\d+ eps\)/g, "");
            results.push({
                id: id,
                title: atag.text(),
                url: `${baseUrl}${atag.attr("href")}`,
                image: (_d = card.find("img")) === null || _d === void 0 ? void 0 : _d.attr("data-src"),
                duration: (_e = card.find(".fdi-duration")) === null || _e === void 0 ? void 0 : _e.text(),
                japaneseTitle: atag.attr("data-jname"),
                type: type,
                nsfw: ((_f = card.find(".tick-rate")) === null || _f === void 0 ? void 0 : _f.text()) === "18+" ? true : false,
                sub: parseInt((_g = card.find(".tick-item.tick-sub")) === null || _g === void 0 ? void 0 : _g.text()) || 0,
                dub: parseInt((_h = card.find(".tick-item.tick-dub")) === null || _h === void 0 ? void 0 : _h.text()) || 0,
                episodes: parseInt((_j = card.find(".tick-item.tick-eps")) === null || _j === void 0 ? void 0 : _j.text()) || 0,
            });
        });
        return results;
    }
    catch (err) {
        throw http_errors_1.default.InternalServerError(
        // @ts-ignore
        (err === null || err === void 0 ? void 0 : err.message) || "Something went wrong");
    }
};
exports.scrapeCard = scrapeCard;
function retrieveServerId($, index, category) {
    var _a, _b, _c;
    return (((_c = (_b = (_a = $(`.ps_-block.ps_-block-sub.servers-${category} > .ps__-list .server-item`)) === null || _a === void 0 ? void 0 : _a.map((_, el) => $(el).attr("data-server-id") == `${index}` ? $(el) : null)) === null || _b === void 0 ? void 0 : _b.get()[0]) === null || _c === void 0 ? void 0 : _c.attr("data-id")) || null);
}
exports.retrieveServerId = retrieveServerId;
//# sourceMappingURL=methods.js.map