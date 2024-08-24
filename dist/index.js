"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("./config/cors"));
const morgan_1 = __importDefault(require("morgan"));
const notFoundHandler_1 = __importDefault(require("./config/notFoundHandler"));
const errorHandler_1 = __importDefault(require("./config/errorHandler"));
const hianime_1 = __importDefault(require("./routes/hianime"));
const gogoanime_1 = __importDefault(require("./routes/gogoanime"));
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
const app = (0, express_1.default)();
app.use((0, morgan_1.default)("dev"));
app.use(cors_1.default);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.send("Hello World!!");
});
// routes
app.use("/anime/gogoanime", gogoanime_1.default);
app.use("/anime/hianime", hianime_1.default);
// handler
app.use(notFoundHandler_1.default);
app.use(errorHandler_1.default);
app.listen(PORT, () => console.log("Server Running on PORT:", { PORT }));
//# sourceMappingURL=index.js.map