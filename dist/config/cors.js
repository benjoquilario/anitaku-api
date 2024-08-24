"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const corsConfig = (0, cors_1.default)({
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200,
    methods: "GET",
});
exports.default = corsConfig;
//# sourceMappingURL=cors.js.map