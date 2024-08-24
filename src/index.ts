import express, { Request, Response } from "express"
import dotenv from "dotenv"
import corsConfig from "./config/cors"
import morgan from "morgan"
import notFoundHandler from "./config/notFoundHandler"
import errorHandler from "./config/errorHandler"

import hianimeRoutes from "./routes/hianime"
import gogoanimeRoutes from "./routes/gogoanime"

dotenv.config()

const PORT = process.env.PORT || 5000
const app: express.Application = express()

app.use(morgan("dev"))
app.use(corsConfig)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!!")
})

// routes
app.use("/anime/gogoanime", gogoanimeRoutes)
app.use("/anime/hianime", hianimeRoutes)
// handler

app.use(notFoundHandler)
app.use(errorHandler)
app.listen(PORT, () => console.log("Server Running on PORT:", { PORT }))
