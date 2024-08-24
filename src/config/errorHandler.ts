import type { ErrorRequestHandler } from "express"

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  const status = error?.status || 500
  res.status(status).json({
    status,
    message: error?.message || "Something went wrong",
  })
}

export default errorHandler
