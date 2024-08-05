"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const gogoanime_1 = require("./routes/gogoanime");
console.log("");
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200,
    // port: PORT,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.send("Hello World!!");
});
app.listen(PORT, () => console.log("Server Running on PORT:", { PORT }));
app.get("/search/:query", async (req, res) => {
    try {
        const query = req.params.query;
        const page = req.query.page;
        const data = await (0, gogoanime_1.search)(query, Number(page)).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) { }
});
app.get("/info/:id", async (req, res) => {
    try {
        const id = decodeURIComponent(req.params.id);
        const data = await (0, gogoanime_1.fetchAnimeInfo)(id).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
    }
});
app.get("/watch/:episodeId", async (req, res) => {
    try {
        const episodeId = req.params.episodeId;
        const server = req.query.server;
        const data = await (0, gogoanime_1.fetchEpisodeSources)(episodeId, server).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
    }
});
app.get("/servers/:episodeId", async (req, res) => {
    const episodeId = req.params.episodeId;
    try {
        const data = await (0, gogoanime_1.fetchEpisodeServers)(episodeId).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
    }
});
app.get("/recent-episodes", async (req, res) => {
    try {
        const type = req.query.type || 1;
        const page = req.query.page || 1;
        const data = await (0, gogoanime_1.fetchRecentEpisodes)(Number(page), Number(type)).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
    }
});
app.get("/genre/:genre", async (req, res) => {
    const genre = req.params.genre;
    const page = req.query.page || 1;
    try {
        const data = await (0, gogoanime_1.fetchGenreInfo)(genre, Number(page)).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
    }
});
app.get("/genre/list", async (req, res) => {
    try {
        const data = await (0, gogoanime_1.fetchGenreList)().catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
    }
});
app.get("/top-airing", async (req, res) => {
    const page = req.query.page || 1;
    try {
        const data = await (0, gogoanime_1.fetchTopAiring)(Number(page)).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
    }
});
app.get("/popular", async (req, res) => {
    const page = req.query.page || 1;
    try {
        const data = await (0, gogoanime_1.fetchPopular)(Number(page)).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
    }
});
app.get("/movies", async (req, res) => {
    const page = req.query.page || 1;
    try {
        const data = await (0, gogoanime_1.fetchRecentMovies)(Number(page)).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
    }
});
app.get("/anime-list", async (req, res) => {
    const page = req.query.page || 1;
    try {
        const data = await (0, gogoanime_1.fetchAnimeList)(Number(page)).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
    }
});
app.get("/new-season", async (req, res) => {
    const page = req.query.page || 1;
    try {
        const data = await (0, gogoanime_1.fetchNewSeason)(Number(page)).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
    }
});
app.get("/download", async (req, res) => {
    try {
        const downloadLink = req.query.link;
        if (!downloadLink) {
            res.status(400).send("Invalid link");
        }
        const data = await (0, gogoanime_1.fetchDirectDownloadLink)(downloadLink).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
    }
});
//# sourceMappingURL=index.js.map