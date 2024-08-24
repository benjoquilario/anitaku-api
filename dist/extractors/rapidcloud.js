"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const utils_1 = require("../utils/");
// https://megacloud.tv/embed-2/e-1/IxJ7GjGVCyml?k=1
class RapidCloud {
    constructor() {
        this.serverName = "RapidCloud";
        this.sources = [];
        // https://rapid-cloud.co/embed-6/eVZPDXwVfrY3?vast=1
        this.fallbackKey = "c1d17096f2ca11b7";
        this.host = "https://rapid-cloud.co";
    }
    async extract(videoUrl) {
        var _a, _b;
        const result = {
            sources: [],
            subtitles: [],
        };
        try {
            const id = (_a = videoUrl.href.split("/").pop()) === null || _a === void 0 ? void 0 : _a.split("?")[0];
            const options = {
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            };
            let res = null;
            res = await axios_1.default.get(`https://${videoUrl.hostname}/embed-2/ajax/e-1/getSources?id=${id}`, options);
            let { data: { sources, tracks, intro, outro, encrypted }, } = res;
            let decryptKey = await (await axios_1.default.get("https://raw.githubusercontent.com/cinemaxhq/keys/e1/key")).data;
            decryptKey = (0, utils_1.substringBefore)((0, utils_1.substringAfter)(decryptKey, '"blob-code blob-code-inner js-file-line">'), "</td>");
            if (!decryptKey) {
                decryptKey = await (await axios_1.default.get("https://raw.githubusercontent.com/cinemaxhq/keys/e1/key")).data;
            }
            if (!decryptKey)
                decryptKey = this.fallbackKey;
            try {
                if (encrypted) {
                    const sourcesArray = sources.split("");
                    let extractedKey = "";
                    let currentIndex = 0;
                    for (const index of decryptKey) {
                        const start = index[0] + currentIndex;
                        const end = start + index[1];
                        for (let i = start; i < end; i++) {
                            extractedKey += res.data.sources[i];
                            sourcesArray[i] = "";
                        }
                        currentIndex += index[1];
                    }
                    decryptKey = extractedKey;
                    sources = sourcesArray.join("");
                    const decrypt = crypto_js_1.default.AES.decrypt(sources, decryptKey);
                    sources = JSON.parse(decrypt.toString(crypto_js_1.default.enc.Utf8));
                }
            }
            catch (err) {
                console.log(err.message);
                throw new Error("Cannot decrypt sources. Perhaps the key is invalid.");
            }
            this.sources = sources === null || sources === void 0 ? void 0 : sources.map((s) => ({
                url: s.file,
                isM3U8: s.file.includes(".m3u8"),
            }));
            result.sources.push(...this.sources);
            if (videoUrl.href.includes(new URL(this.host).host)) {
                result.sources = [];
                this.sources = [];
                for (const source of sources) {
                    const { data } = await axios_1.default.get(source.file, options);
                    const m3u8data = data
                        .split("\n")
                        .filter((line) => line.includes(".m3u8") && line.includes("RESOLUTION="));
                    const secondHalf = m3u8data.map((line) => { var _a; return (_a = line.match(/RESOLUTION=.*,(C)|URI=.*/g)) === null || _a === void 0 ? void 0 : _a.map((s) => s.split("=")[1]); });
                    const TdArray = secondHalf.map((s) => {
                        const f1 = s[0].split(",C")[0];
                        const f2 = s[1].replace(/"/g, "");
                        return [f1, f2];
                    });
                    for (const [f1, f2] of TdArray) {
                        this.sources.push({
                            url: `${(_b = source.file) === null || _b === void 0 ? void 0 : _b.split("master.m3u8")[0]}${f2.replace("iframes", "index")}`,
                            quality: f1.split("x")[1] + "p",
                            isM3U8: f2.includes(".m3u8"),
                        });
                    }
                    result.sources.push(...this.sources);
                }
            }
            result.intro =
                (intro === null || intro === void 0 ? void 0 : intro.end) > 1 ? { start: intro.start, end: intro.end } : undefined;
            result.outro =
                (outro === null || outro === void 0 ? void 0 : outro.end) > 1 ? { start: outro.start, end: outro.end } : undefined;
            result.sources.push({
                url: sources[0].file,
                isM3U8: sources[0].file.includes(".m3u8"),
                quality: "auto",
            });
            result.subtitles = tracks
                .map((s) => s.file
                ? { url: s.file, lang: s.label ? s.label : "Thumbnails" }
                : null)
                .filter((s) => s);
            return result;
        }
        catch (err) {
            console.log(err.message);
            throw err;
        }
    }
}
exports.default = RapidCloud;
//# sourceMappingURL=rapidcloud.js.map