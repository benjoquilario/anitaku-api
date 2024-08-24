"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const notFoundHandler = (req, res, next) => {
    return next(http_errors_1.default.NotFound());
};
exports.default = notFoundHandler;
//# sourceMappingURL=notFoundHandler.js.map