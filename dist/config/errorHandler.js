"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (error, req, res, next) => {
    const status = (error === null || error === void 0 ? void 0 : error.status) || 500;
    res.status(status).json({
        status,
        message: (error === null || error === void 0 ? void 0 : error.message) || "Something went wrong",
    });
};
exports.default = errorHandler;
//# sourceMappingURL=errorHandler.js.map