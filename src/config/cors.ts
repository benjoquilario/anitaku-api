import cors from "cors"

const corsConfig = cors({
  origin: "*",
  credentials: true,
  optionsSuccessStatus: 200,
  methods: "GET",
})

export default corsConfig
